"use client";

import {
  Copy,
  Download,
  FileText,
  FileUp,
  Folder,
  FolderInput,
  Plus,
  Tag,
  Trash2,
  Eye,
  Pencil,
} from "lucide-react";
import { cn } from "../lib";
import { Button } from "./Button";
import { ActionMenu } from "./ActionMenu";
import { Tooltip } from "./Tooltip";
import { FileAction, FileNode } from "../types";
import { useFileExplorerContext } from "../context";

function PillGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center rounded-full border border-(--_fe-glass-border) bg-(--_fe-glass-bg) p-1 shadow-(--_fe-shadow-soft)">
      {children}
    </div>
  );
}

interface PrimaryToolbarProps {
  onAction: (action: FileAction) => void;
  selected: FileNode[];
}

type ToolbarButtonConfig = {
  action: FileAction;
  icon: typeof Copy;
  requiresSelection?: boolean;
  requiresSingle?: boolean;
  isDelete?: boolean;
};

const PRIMARY_ACTIONS: ToolbarButtonConfig[] = [
  { action: "copy", icon: Copy, requiresSelection: true },
  { action: "move", icon: FolderInput, requiresSelection: true },
  {
    action: "rename",
    icon: Pencil,
    requiresSelection: true,
    requiresSingle: true,
  },
  {
    action: "delete",
    icon: Trash2,
    requiresSelection: true,
    isDelete: true,
  },
];

const SECONDARY_ACTIONS: ToolbarButtonConfig[] = [
  {
    action: "preview",
    icon: Eye,
    requiresSelection: true,
    requiresSingle: true,
  },
  {
    action: "download",
    icon: Download,
    requiresSelection: true,
  },
  {
    action: "edit",
    icon: Tag,
    requiresSelection: true,
    requiresSingle: true,
  },
];

function ToolbarActionButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  isDelete,
}: {
  label: string;
  icon: typeof Copy;
  onClick: () => void;
  disabled?: boolean;
  isDelete?: boolean;
}) {
  return (
    <Button
      type="button"
      tip={label}
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full px-0 transition-colors",
        isDelete
          ? "text-red-500 hover:bg-(--_fe-danger-soft) hover:text-red-600"
          : "text-(--_fe-text-sub) hover:bg-(--_fe-hover) hover:text-(--_fe-text)",
      )}
    >
      <Icon size={18} strokeWidth={1.9} />
    </Button>
  );
}

export const PrimaryToolbar = ({ onAction, selected }: PrimaryToolbarProps) => {
  const { features, openUploadDialog, t } = useFileExplorerContext();
  const selectedCount = selected.length;
  const actionLabel = (action: FileAction) =>
    ({
      copy: t("action.copy"),
      move: t("action.move"),
      rename: t("action.rename"),
      delete: t("action.delete"),
      preview: t("action.open"),
      download: t("action.download"),
      edit: t("action.detail"),
    })[action];
  const createItems = [
    {
      label: t("action.uploadFile"),
      icon: FileUp,
      action: "upload",
      separator: true,
    },
    { label: t("action.newFolder"), icon: Folder, action: "new-folder" },
    { label: t("action.newTextFile"), icon: FileText, action: "new-file" },
  ];

  const visibleCreateItems = createItems.filter((item) => {
    if (item.action === "upload") {
      return features.uploadFile || features.uploadFolder;
    }
    if (item.action === "new-folder") return features.newFolder;
    if (item.action === "new-file") return features.newFile;
    return true;
  });

  const visiblePrimaryActions = PRIMARY_ACTIONS.filter((item) => {
    if (item.action === "copy") return features.copy;
    if (item.action === "move") return features.move;
    if (item.action === "rename") return features.rename;
    if (item.action === "delete") return features.delete;
    return true;
  });

  const visibleSecondaryActions = SECONDARY_ACTIONS.filter((item) => {
    if (item.action === "preview") return features.preview;
    if (item.action === "edit") return features.detail;
    if (item.action === "download") return features.download;
    return true;
  });

  const isActionDisabled = ({
    requiresSelection,
    requiresSingle,
  }: Pick<ToolbarButtonConfig, "requiresSelection" | "requiresSingle">) => {
    if (requiresSelection && selectedCount === 0) return true;
    if (requiresSingle && selectedCount !== 1) return true;
    return false;
  };

  const handleCreateAction = (action: string) => {
    if (action === "upload") {
      openUploadDialog();
      return;
    }

    onAction(action as FileAction);
  };

  return (
    <div
      role="toolbar"
      aria-label={t("action.display")}
      className="hidden items-center gap-4 md:flex"
    >
      {visibleCreateItems.length > 0 && (
        <ActionMenu
          align="start"
          items={visibleCreateItems}
          onAction={handleCreateAction}
          trigger={
            <Tooltip
              content={t("action.create")}
              trigger={
                <PillGroup>
                  <ToolbarActionButton
                    label={t("action.create")}
                    icon={Plus}
                    onClick={() => undefined}
                  />
                </PillGroup>
              }
            />
          }
        />
      )}
      {visiblePrimaryActions.length > 0 && (
        <PillGroup>
          {visiblePrimaryActions.map((item, index) => (
            <div
              key={item.action}
              className={cn("flex items-center", index > 0 && "ml-1")}
            >
              <ToolbarActionButton
                label={actionLabel(item.action)}
                icon={item.icon}
                disabled={isActionDisabled(item)}
                isDelete={item.isDelete}
                onClick={() => onAction(item.action)}
              />
            </div>
          ))}
        </PillGroup>
      )}
      {visibleSecondaryActions.length > 0 && (
        <PillGroup>
          {visibleSecondaryActions.map((item, index) => (
            <div
              key={item.action}
              className={cn("flex items-center", index > 0 && "ml-1")}
            >
              <ToolbarActionButton
                label={actionLabel(item.action)}
                icon={item.icon}
                disabled={isActionDisabled(item)}
                onClick={() => onAction(item.action)}
              />
            </div>
          ))}
        </PillGroup>
      )}
    </div>
  );
};

// Backward-compatible alias for previous internal name.
export const ToolbarNew = PrimaryToolbar;
