"use client";

import {
  FileText,
  FileUp,
  Folder,
  Grid2x2,
  ListOrdered,
  Plus,
  Rows3,
  type LucideIcon,
  X,
} from "lucide-react";
import { FileAction, FileNode, getToolbarActions } from "../types";
import { useExplorerState, useFileSelector } from "../hooks";
import { ColorMultiSelect } from "./ColorMultiSelect";
import { Button } from "./Button";
import { ActionMenu } from "./ActionMenu";
import { useFileExplorerContext } from "../context";
import { ToggleButton } from "../ui/ToggleButton";

type ToolbarMenuItem = {
  label: string;
  action?: string;
  checked?: boolean;
  isHeader?: boolean;
  separator?: boolean;
  icon?: LucideIcon;
};

interface ViewToolbarProps {
  explorer: ReturnType<typeof useExplorerState>;
  selection: ReturnType<typeof useFileSelector<FileNode>>;
  onBatchAction: (id: FileAction) => void;
  onAction: (action: FileAction, item?: FileNode) => void;
  showCreateAction?: boolean;
  showSelectionActions?: boolean;
}

export const ViewToolbar = ({
  explorer,
  selection,
  onBatchAction,
  onAction: onFileAction,
  showCreateAction = true,
  showSelectionActions = true,
}: ViewToolbarProps) => {
  const { features, openUploadDialog, t } = useFileExplorerContext();
  const selectedCount = selection.selected.length;
  const isListView = explorer.view.mode === "list";
  const { sort, filter } = explorer;

  // Keep toolbar-only display configuration local to the toolbar so this file
  // remains self-contained after the component merge.
  const menuItems: ToolbarMenuItem[] = [
    { label: t("toolbar.sortBy"), isHeader: true },
    {
      label: t("toolbar.name"),
      action: "sort:name",
      checked: sort.field === "name",
    },
    {
      label: t("toolbar.modifiedDate"),
      action: "sort:updatedAt",
      checked: sort.field === "updatedAt",
    },
    {
      label: t("toolbar.type"),
      action: "sort:type",
      checked: sort.field === "type",
    },
    {
      label: t("toolbar.size"),
      action: "sort:size",
      checked: sort.field === "size",
    },
    { label: t("toolbar.sortDirection"), isHeader: true },
    {
      label: t("toolbar.ascending"),
      action: "dir:asc",
      checked: sort.direction === "asc",
    },
    {
      label: t("toolbar.descending"),
      action: "dir:desc",
      checked: sort.direction === "desc",
    },
    { label: t("toolbar.hiddenFiles"), isHeader: true },
    {
      label: t("toolbar.showHidden"),
      action: "hidden:show",
      checked: filter.showHidden,
    },
    {
      label: t("toolbar.hideHidden"),
      action: "hidden:hide",
      checked: !filter.showHidden,
    },
  ];

  const finalMenuItems = features.tagFilter
    ? [
        ...menuItems,
        { label: t("toolbar.tagFilter"), isHeader: true },
        {
          label: t("toolbar.colorMultiSelect"),
          render: () => (
            <ColorMultiSelect
              selected={explorer.filter.colors}
              onChange={explorer.filter.setColors}
            />
          ),
        },
      ]
    : menuItems;

  const handleViewAction = (action: string) => {
    if (action.startsWith("sort:")) {
      sort.setField(action.split(":")[1] as typeof sort.field);
      return;
    }

    if (action.startsWith("dir:")) {
      sort.setDirection(action.split(":")[1] as typeof sort.direction);
      return;
    }

    if (action.startsWith("hidden:")) {
      filter.setShowHidden(action === "hidden:show");
    }
  };

  const createItems = [
    (features.uploadFile || features.uploadFolder) && {
      label: t("action.uploadFile"),
      icon: FileUp,
      action: "upload",
      separator: true,
    },
    features.newFolder && {
      label: t("action.newFolder"),
      icon: Folder,
      action: "new-folder",
    },
    features.newFile && {
      label: t("action.newTextFile"),
      icon: FileText,
      action: "new-file",
    },
  ].filter(Boolean) as {
    label: string;
    icon: LucideIcon;
    action: string;
    separator?: boolean;
  }[];

  const handleCreateAction = (action: string) => {
    if (action === "upload") {
      openUploadDialog();
      return;
    }

    onFileAction(action as FileAction);
  };

  const visibleBatchActions = getToolbarActions(t).filter((btn) => {
    if (btn.id === "preview") return features.preview;
    if (btn.id === "edit") return features.detail;
    if (btn.id === "download") return features.download;
    if (btn.id === "move") return features.move;
    if (btn.id === "copy") return features.copy;
    if (btn.id === "rename") return features.rename;
    if (btn.id === "delete") return features.delete;
    return true;
  });

  return (
    <div className="flex" onClick={(e) => e.stopPropagation()}>
      {showSelectionActions && selectedCount > 0 ? (
        <div className="bg-(--_fe-active) flex w-full items-center gap-2 rounded-full px-3 py-1">
          <div className="border-(--_fe-active) text-(--_fe-text) mr-1 flex shrink-0 items-center border-r px-3 text-xs font-bold">
            {t("status.selectedCount", { count: selectedCount })}
          </div>

          {visibleBatchActions.map((btn) => {
            const { requiresSingle, separator, id, label, ...domSafeProps } =
              btn;

            return (
              <Button
                key={id}
                {...domSafeProps}
                tip={label}
                variant="ghost"
                className="h-8 w-8"
                disabled={requiresSingle && selectedCount !== 1}
                onClick={() => onBatchAction(id)}
              />
            );
          })}

          <div className="flex-1" />

          <Button
            icon={X}
            variant="ghost"
            className="h-8 w-8"
            tip={t("action.clearSelection")}
            onClick={selection.unSelectAll}
          />
        </div>
      ) : (
        <>
          {/* Keep all primary top-bar actions together so the header behavior is
          easier to follow and maintain. */}
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {showCreateAction && createItems.length > 0 && (
                <ActionMenu
                  onAction={handleCreateAction}
                  items={createItems}
                  trigger={
                    <Button
                      icon={Plus}
                      variant="primary"
                      tip={t("action.create")}
                      className="size-9 rounded-full px-0 sm:h-9 sm:w-auto sm:rounded-lg sm:px-4"
                    >
                      {/* Collapse labels on smaller widths so the toolbar keeps
                      its main actions visible before wrapping. */}
                      <span className="hidden sm:inline">
                        {t("action.create")}
                      </span>
                    </Button>
                  }
                />
              )}

              <ActionMenu
                mode="left-click"
                items={finalMenuItems}
                onAction={handleViewAction}
                trigger={
                  <Button
                    variant="ghost"
                    className="group size-9 rounded-full px-0 sm:h-9 sm:w-auto sm:rounded-lg sm:px-4"
                    tip={t("action.showOptions")}
                  >
                    <div className="flex items-center gap-1">
                      <ListOrdered
                        size={14}
                        className="transition-transform group-data-[state=open]:rotate-180"
                      />
                      <span className="hidden sm:inline">
                        {t("action.display")}
                      </span>
                    </div>
                  </Button>
                }
              />
            </div>

            <ToggleButton
              value={explorer.view.mode}
              onChange={(value) => explorer.view.setMode(value)}
              items={[
                {
                  value: "grid",
                  icon: Grid2x2,
                },
                {
                  value: "list",
                  icon: Rows3,
                },
              ]}
              className="h-8   border border-(--_fe-border) bg-(--_fe-bg) p-px "
              itemClassName="h-full min-w-8 cursor-pointer    text-(--_fe-text-sub) data-[state=on]:text-(--_fe-selected) hover:text-(--_fe-selected)"
              showSeparator={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Backward-compatible alias for existing imports.
export const Toolbar = ViewToolbar;
