import { useMemo, useState, useEffect, useCallback } from "react";
import { CategoryColor, FileNode } from "../types";
import { useExplorerState } from "./useExplorerState";
import { useFileActions } from "./useFileActions";
import { useFileSelector } from "./useFileSelector";
import { useFileDragSelect } from "./useFileDragSelect";
import { useFileExplorerContext } from "../context";

export function useFileScene(filesData: FileNode[], currentFolderId: string) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [localFiles, setLocalFiles] = useState(() => filesData);
  const [stickyIds, setStickyIds] = useState<string[]>([]);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  useEffect(() => {
    setLocalFiles(filesData);
  }, [filesData, currentFolderId]);

  useEffect(() => {
    setStickyIds([]);
    setNewlyCreatedId(null);
  }, [currentFolderId]);

  const {
    lang,
    defaultViewMode,
    viewMode,
    onViewModeChange,
    defaultSortField,
    defaultSortDirection,
    sortField,
    sortDirection,
    onSortChange,
    listColumns,
    t,
    allowMultiSelect,
    onOpen,
    onOpenFolder,
    onTagColorsChange,
    openFileDetail,
    onCreate,
    onRename,
    onDelete,
    onCopy,
    onMove,
  } = useFileExplorerContext();
  const sortAccessors = useMemo(
    () =>
      Object.fromEntries(
        (listColumns ?? [])
          .filter((column) => Boolean(column.sortValue))
          .map((column) => [String(column.key), column.sortValue!]),
      ),
    [listColumns],
  );
  const explorer = useExplorerState(localFiles, lang, {
    defaultViewMode,
    viewMode,
    onViewModeChange,
    defaultSortField,
    defaultSortDirection,
    sortField,
    sortDirection,
    onSortChange,
    sortAccessors,
  });

  const addStickyItem = useCallback((id: string) => {
    setStickyIds((prev) => [id, ...prev]);
    setNewlyCreatedId(id);
    setTimeout(() => setNewlyCreatedId(null), 3000);
  }, []);

  const stickySort = useCallback(
    (sortedBase: FileNode[]) => {
      if (stickyIds.length === 0) return sortedBase;

      // This sorting state is only used by the scene orchestration, so keeping
      // it local removes a tiny hook without losing clarity.
      const stickyItems = stickyIds
        .map((id) => sortedBase.find((item) => item.id === id))
        .filter(Boolean) as FileNode[];
      const others = sortedBase.filter((item) => !stickyIds.includes(item.id));

      const sortByType = (items: FileNode[], type: FileNode["type"]) =>
        items.filter((item) => item.type === type);

      return [
        ...sortByType(stickyItems, "folder"),
        ...sortByType(others, "folder"),
        ...sortByType(stickyItems, "file"),
        ...sortByType(others, "file"),
      ];
    },
    [stickyIds],
  );

  const finalDisplayFiles = useMemo(() => {
    return stickySort(explorer.files);
  }, [explorer.files, stickySort]);

  const selection = useFileSelector<FileNode>(
    finalDisplayFiles,
    currentFolderId,
    allowMultiSelect,
  );

  const actions = useFileActions(
    selection.selected,
    currentFolderId,
    () => selection.unSelectAll(),
    setLocalFiles,
    addStickyItem,
    openFileDetail,
    t,
    onCreate,
    onRename,
    onDelete,
    onCopy,
    onMove,
  );

  const { DragSelection, isDraggingRef } = useFileDragSelect(
    finalDisplayFiles,
    selection.selected,
    selection.setSelected,
    container,
    allowMultiSelect,
  );

  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node);
  }, []);

  useEffect(() => {
    if (!newlyCreatedId || !container) return;
    const timer = setTimeout(() => {
      const el = container.querySelector(`[data-id="${newlyCreatedId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => clearTimeout(timer);
  }, [newlyCreatedId, container]);

  const handleItemDoubleClick = useCallback(
    (item: FileNode) => {
      if (item.type === "folder") {
        onOpenFolder?.(item);
        return;
      }

      onOpen?.(item);
    },
    [onOpen, onOpenFolder],
  );

  const handleTagColorsChange = useCallback(
    (item: FileNode, colors: CategoryColor[]) => {
      // Update local state first so tags render immediately in the current view.
      setLocalFiles((prev) =>
        prev.map((file) =>
          file.id === item.id ? { ...file, tagColors: colors } : file,
        ),
      );
      onTagColorsChange?.(item, colors);
    },
    [onTagColorsChange],
  );

  const listProps = {
    selected: selection.selected,
    isSelected: selection.isSelected,
    onItemClick: selection.handleItemClick,
    onAction: actions.dispatch,
    onSortAction: (key: string) => {
      if (explorer.sort.field === key) {
        explorer.sort.set(
          key,
          explorer.sort.direction === "asc" ? "desc" : "asc",
        );
        return;
      }

      explorer.sort.set(key, "asc");
    },
    onDoubleClick: handleItemDoubleClick,
    onTagColorsChange: handleTagColorsChange,
    newlyCreatedId,
    editingItemId: actions.editingEntry?.id ?? null,
    editingName: actions.editingEntry?.name ?? "",
    editingSelectKey: actions.editingSelectKey,
    onEditingNameChange: actions.setEditingName,
    onEditingNameSubmit: actions.confirmEditing,
    onEditingNameCancel: actions.cancelEditing,
    allData: finalDisplayFiles,
    sortConfig: {
      key: explorer.sort.field,
      dir: explorer.sort.direction,
    },
  };

  return {
    explorer,
    selection,
    actions,
    listProps,
    finalDisplayFiles,
    DragSelection,
    isDraggingRef,
    scrollRef,
  };
}
