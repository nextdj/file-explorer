"use client";

import { CategoryColor, FileAction, FileNode } from "../types";
import { ColorTags } from "./ColorTags";
import { Tooltip } from "./Tooltip";
import {
  buildDefaultContextMenuItems,
  bytesFormat,
  cn,
  composeContextMenuItems,
  formatDateTime,
  resolveContextMenuItems,
} from "../lib";
import { ActionMenu } from "./ActionMenu";
import { Button } from "./Button";
import { getFileConfig } from "../lib/file-utils";
import { useFileExplorerContext } from "../context";
import { InlineNameInput } from "./InlineNameInput";
import { MoreVertical } from "lucide-react";

interface Props {
  fileNode: FileNode;
  className?: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onAction: (action: FileAction, item: FileNode) => void;
  onDoubleClick?: (item: FileNode) => void;
  onTagColorsChange?: (item: FileNode, colors: CategoryColor[]) => void;
  isEditing?: boolean;
  editingName?: string;
  editingSelectKey?: number;
  onEditingNameChange?: (value: string) => void;
  onEditingNameSubmit?: () => void;
  onEditingNameCancel?: () => void;
}

export const FileItem = ({
  onAction,
  fileNode,
  className,
  active,
  onClick,
  onDoubleClick,
  onTagColorsChange,
  isEditing,
  editingName,
  editingSelectKey,
  onEditingNameChange,
  onEditingNameSubmit,
  onEditingNameCancel,
}: Props) => {
  const {
    lang,
    t,
    dateFormat,
    renderPreview,
    features,
    appendContextMenuItems,
    hideContextMenuActions,
    replaceContextMenuActions,
    getContextMenuItems,
  } = useFileExplorerContext();
  const { Icon, color, bgClass, label } = getFileConfig(fileNode.name, lang);
  const tagColors = fileNode.tagColors ?? [];
  const preview = renderPreview?.(fileNode);
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

  const handleDoubleClick = () => {
    onDoubleClick?.(fileNode);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-transparent transition-colors duration-150 ease-out select-none",
        "hover:border-(--_fe-border)",
        active && "border-(--_fe-border) shadow-md",
        className,
      )}
    >
      {/* Action menu trigger */}
      <div
        className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionMenu
          items={menuItems}
          onAction={(id) => onAction(id as FileAction, fileNode)}
          trigger={
            <Button
              variant="ghost"
              icon={MoreVertical}
              className="h-6 w-6 rounded-full bg-transparent px-0 text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100 hover:bg-black/55 hover:text-white"
            />
          }
        />
      </div>

      {/* Media area */}
      <div className="aspect-4/3 w-full overflow-hidden">
        {preview ?? (
          <div className="bg-(--_fe-item-bg-soft) relative flex h-full w-full items-center justify-center">
            <div
              className={cn(
                "absolute top-3 left-3 rounded-full px-2 py-1 text-[length:var(--_fe-font-2xs)] leading-none font-medium tracking-[0.08em]",
                bgClass,
                color,
              )}
            >
              {label}
            </div>
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-5.5",
              )}
            >
              <Icon
                className={cn("h-10 w-10 shrink-0", color)}
                strokeWidth={1.5}
              />
            </div>
          </div>
        )}
      </div>

      {/* File metadata */}
      <div className="p-3 ">
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()}>
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
            <div className="text-(--_fe-selected) line-clamp-1 text-left text-[length:var(--_fe-font-sm)] break-all">
              {tagColors.length > 0 && (
                <span className="mr-1.5 inline-flex -translate-y-px items-center">
                  <ColorTags colors={tagColors} size={10} />
                </span>
              )}

              {fileNode.name}
            </div>
          </Tooltip>
        )}
        <p
          className="text-(--_fe-text-muted) mt-1 text-[length:var(--_fe-font-xs)]"
          suppressHydrationWarning
        >
          {formatDateTime(fileNode.updatedAt, dateFormat)}
        </p>
        <p className="text-(--_fe-text-muted) mt-1 text-[length:var(--_fe-font-xs)]">
          {fileNode.size && bytesFormat(fileNode.size)}
        </p>
      </div>
    </div>
  );
};
