"use client";

import { Folder, MoreVertical } from "lucide-react";
import { CategoryColor, FileAction, FileNode } from "../types";
import { ActionMenu } from "./ActionMenu";
import { Button } from "./Button";
import { ColorTags } from "./ColorTags";
import { Tooltip } from "./Tooltip";
import {
  buildDefaultContextMenuItems,
  cn,
  composeContextMenuItems,
  resolveContextMenuItems,
} from "../lib";
import { InlineNameInput } from "./InlineNameInput";
import { useFileExplorerContext } from "../context";

interface FileFolderProps {
  fileNode: FileNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  onAction: (action: FileAction, item: FileNode) => void;
  onDoubleClick?: (item: FileNode) => void;
  isEditing?: boolean;
  editingName?: string;
  editingSelectKey?: number;
  onEditingNameChange?: (value: string) => void;
  onEditingNameSubmit?: () => void;
  onEditingNameCancel?: () => void;
  onTagColorsChange?: (item: FileNode, colors: CategoryColor[]) => void;
}
export const FileFolder = ({
  fileNode,
  active,
  onClick,
  className,
  onAction,
  onDoubleClick,
  isEditing,
  editingName,
  editingSelectKey,
  onEditingNameChange,
  onEditingNameSubmit,
  onEditingNameCancel,
  onTagColorsChange,
}: FileFolderProps) => {
  const tagColors = fileNode.tagColors ?? [];
  const {
    t,
    features,
    appendContextMenuItems,
    hideContextMenuActions,
    replaceContextMenuActions,
    getContextMenuItems,
  } = useFileExplorerContext();
  const defaultMenuItems = buildDefaultContextMenuItems(
    fileNode,
    onTagColorsChange,
    {
      t,
      preview: features.preview,
      detail: features.detail,
      download: features.download,
      move: features.move,
      copy: features.copy,
      rename: features.rename,
      delete: features.delete,
      tagFilter: features.tagFilter,
    },
  );
  const menuItems = resolveContextMenuItems(
    fileNode,
    composeContextMenuItems(fileNode, defaultMenuItems, {
      appendItems: appendContextMenuItems?.(fileNode),
      hideActions: hideContextMenuActions?.(fileNode),
      replaceActions: replaceContextMenuActions?.(fileNode),
      getContextMenuItems,
    }),
  );

  return (
    <div
      onClick={onClick}
      onDoubleClick={() => onDoubleClick?.(fileNode)}
      className={cn(
        "bg-(--_fe-item-bg-soft) group relative flex w-full cursor-pointer items-center justify-start gap-2.5 rounded-lg border border-transparent p-2 transition-colors   select-none",
        active
          ? "bg-(--_fe-active-subtle) border-(--_fe-border)"
          : "hover:border-(--_fe-border)",
        className,
      )}
    >
      {/* Keep the action menu pinned to the top-right corner. */}
      <div className="absolute top-1/2 right-2 z-10 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <ActionMenu
          items={menuItems}
          onAction={(id) => onAction(id as FileAction, fileNode)}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              icon={MoreVertical}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent px-0 text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100 hover:bg-black/55 hover:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          }
        />
      </div>

      {/* Keep the leading icon anchored on the left. */}
      <span className="relative h-6 w-6 shrink-0">
        <Folder
          className="absolute inset-0 text-amber-400"
          size={24}
          strokeWidth={1.8}
        />
      </span>
      {tagColors.length > 0 && (
        <div>
          <ColorTags colors={tagColors} />
        </div>
      )}

      {isEditing ? (
        <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
          <InlineNameInput
            value={editingName ?? fileNode.name}
            onChange={(value) => onEditingNameChange?.(value)}
            onSubmit={() => onEditingNameSubmit?.()}
            onCancel={() => onEditingNameCancel?.()}
            selectKey={editingSelectKey}
          />
        </div>
      ) : (
        <Tooltip content={fileNode.name}>
          <p className="text-(--_fe-selected) w-26 truncate pr-8 text-left text-[length:var(--_fe-font-sm)]">
            {fileNode.name}
          </p>
        </Tooltip>
      )}
    </div>
  );
};
