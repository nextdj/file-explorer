"use client";

import { getFileListColumns } from "../_file-list-columns";
import { useMemo } from "react";
import { FileNode, FileViewProps } from "../types";
import { DataTable } from "./DataTable";
import { useFileExplorerContext } from "../context";

export const FileListView = ({
  items,
  selected,
  isSelected,
  onItemClick,
  allData,
  onAction,
  onTagColorsChange,
  onSortAction,
  sortConfig,
  newlyCreatedId,
  onDoubleClick,
  editingItemId,
  editingName,
  editingSelectKey,
  onEditingNameChange,
  onEditingNameSubmit,
  onEditingNameCancel,
}: FileViewProps) => {
  const {
    lang,
    t,
    features,
    getListColumns,
    listColumns,
    appendContextMenuItems,
    hideContextMenuActions,
    replaceContextMenuActions,
    getContextMenuItems,
  } = useFileExplorerContext();
  const columns = useMemo(
    () =>
      getFileListColumns(
        onAction,
        onTagColorsChange,
        {
          editingItemId,
          editingName,
          editingSelectKey,
          onEditingNameChange,
          onEditingNameSubmit,
          onEditingNameCancel,
        },
        appendContextMenuItems,
        hideContextMenuActions,
        replaceContextMenuActions,
        features,
        getContextMenuItems,
        listColumns,
        getListColumns,
        lang,
        t,
      ),
    [
      onAction,
      onTagColorsChange,
      editingItemId,
      editingName,
      editingSelectKey,
      onEditingNameChange,
      onEditingNameSubmit,
      onEditingNameCancel,
      appendContextMenuItems,
      hideContextMenuActions,
      replaceContextMenuActions,
      features,
      getContextMenuItems,
      listColumns,
      getListColumns,
      lang,
      t,
    ],
  );

  return (
    <div className="h-full w-full">
      <DataTable<FileNode>
        tdClassName="py-1"
        variant="primary"
        headers={columns}
        data={items}
        sortConfig={sortConfig}
        onSortAction={onSortAction}
        onRowClickAction={(e, item) => {
          onItemClick(e, item, allData.indexOf(item));
        }}
        onRowDoubleClickAction={(_, item) => {
          onDoubleClick(item);
        }}
        getRowClassName={(row) =>
          row.id === newlyCreatedId
            ? "bg-red-400/30 animate-pulse   transition-all"
            : "transition-colors"
        }
        onRowContextMenu={(e, item) => {
          // Auto-select the row when it is right-clicked while unselected.
          if (!isSelected(item)) {
            onItemClick(e as any, item, allData.indexOf(item));
          }
        }}
        selectedIds={new Set(selected.map((item: FileNode) => item.id))}
      />
    </div>
  );
};
