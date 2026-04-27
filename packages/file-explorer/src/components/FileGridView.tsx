"use client";

import { cn } from "../lib/utils";
import { FileViewProps } from "../types";
import { FileFolder } from "./FileFolder";
import { FileItem } from "./FileItem";
import { useFileExplorerContext } from "../context";

function CountBadge({ count }: { count: number }) {
  return (
    <span className="bg-(--_fe-item-bg) text-(--_fe-text-muted) flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-tight transition-colors">
      {count}
    </span>
  );
}

export const FileGridView = ({
  items,
  isSelected,
  onItemClick,
  allData,
  onAction,
  newlyCreatedId,
  onDoubleClick,
  onTagColorsChange,
  editingItemId,
  editingName,
  editingSelectKey,
  onEditingNameChange,
  onEditingNameSubmit,
  onEditingNameCancel,
}: FileViewProps) => {
  const { t, gridSize } = useFileExplorerContext();
  const gridColumnsClass =
    gridSize === "sm"
      ? "grid-cols-[repeat(auto-fill,minmax(130px,1fr))]"
      : gridSize === "lg"
        ? "grid-cols-[repeat(auto-fill,minmax(190px,1fr))]"
        : "grid-cols-[repeat(auto-fill,minmax(150px,1fr))]";
  const renderItem = (item: any) => {
    const isNew = item.id === newlyCreatedId;
    const active = isSelected(item);
    const index = allData.indexOf(item);

    // Reuse the shared item styling in one place.
    const itemClass = cn(
      "transition-colors duration-150 ease-out",
      isNew ? "animate-pulse bg-red-400/30" : "",
    );

    // Reuse the shared item props for files and folders.
    const commonProps = {
      fileNode: item,
      active,
      className: itemClass,
      onClick: (e: any) => onItemClick(e, item, index),
      onDoubleClick: onDoubleClick,
      onTagColorsChange: onTagColorsChange,
      isEditing: item.id === editingItemId,
      editingName,
      editingSelectKey,
      onEditingNameChange,
      onEditingNameSubmit,
      onEditingNameCancel,
    };

    return (
      <div
        key={item.id}
        data-id={item.id}
        className="file-selectable w-full outline-none"
        onContextMenu={(e) => !active && onItemClick(e as any, item, index)}
      >
        {item.type === "folder" ? (
          <FileFolder {...commonProps} onAction={onAction} />
        ) : (
          <FileItem {...commonProps} onAction={onAction} />
        )}
      </div>
    );
  };

  // Render one grouped section at a time.
  const renderSection = (title: string, list: any[]) =>
    list.length > 0 && (
      <div className="flex flex-col gap-3">
        <h3 className="text-(--_fe-selected) flex gap-2 text-[13px] font-bold tracking-widest uppercase">
          <div>{title}</div>
          {/* This badge is local to the grid section header, so keeping it
          inline avoids an extra component file with almost no reuse. */}
          <CountBadge count={list.length} />
        </h3>
        {/* The grid wrapper is only used here, so its layout reads better when
        kept next to the section rendering logic. */}
        <div
          className={cn(
            "grid gap-x-5 gap-y-3.5",
            gridColumnsClass,
          )}
        >
          {list.map(renderItem)}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-8 pb-10">
      {renderSection(
        t("grid.folders"),
        items.filter((i) => i.type === "folder"),
      )}
      {renderSection(
        t("grid.files"),
        items.filter((i) => i.type !== "folder"),
      )}
    </div>
  );
};
