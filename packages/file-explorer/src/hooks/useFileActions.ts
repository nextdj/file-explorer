import { useState } from "react";
import {
  FileNode,
  FileEntryMode,
  FileEntryType,
  TransferDataSource,
  TransferTarget,
} from "../types";

const DEFAULT_CREATE_NAMES: Record<FileEntryType, string> = {
  folder: "New folder",
  file: "Untitled.txt",
};

export interface EditingEntryState {
  id: string;
  mode: FileEntryMode;
  type: FileEntryType;
  name: string;
  initialValue: string;
  parentId?: string;
}

export interface TransferState {
  open: boolean;
  mode: "copy" | "move" | null;
  items: FileNode[];
  target?: TransferTarget;
}

export function useFileActions(
  selected: FileNode[],
  folderId: string,
  refresh: () => void,
  setFilesData: React.Dispatch<React.SetStateAction<FileNode[]>>,
  onCreated?: (id: string) => void,
  onEdit?: (file: FileNode) => void,
  t: (key: string, vars?: Record<string, string | number>) => string = (
    key,
  ) => key,
  onCreate?: (entry: {
    name: string;
    type: FileNode["type"];
    parentId?: string;
    source?: TransferDataSource;
  }) =>
    | {
        id: string;
        name: string;
        type: FileNode["type"];
        parentId?: string;
      }
    | void
    | Promise<
        | {
            id: string;
            name: string;
            type: FileNode["type"];
            parentId?: string;
          }
        | void
      >,
  onRename?: (entry: {
    id: string;
    name: string;
    type: FileNode["type"];
    parentId?: string;
  }) => void | Promise<void>,
  onDelete?: (entries: FileNode[]) => void | Promise<void>,
  onCopy?: (payload: {
    entries: FileNode[];
    destination: TransferTarget;
  }) => void | Promise<void>,
  onMove?: (payload: {
    entries: FileNode[];
    destination: TransferTarget;
  }) => void | Promise<void>,
) {
  const [editingEntry, setEditingEntry] = useState<EditingEntryState | null>(
    null,
  );
  const [editingSelectKey, setEditingSelectKey] = useState(0);
  const [transferState, setTransferState] = useState<TransferState>({
    open: false,
    mode: null,
    items: [],
  });

  const executeDirectAction = async (action: string, item?: FileNode) => {
    const targets = item ? [item] : selected;
    if (targets.length === 0) return;

    switch (action) {
      case "delete":
        const targetIds = targets.map((target) => target.id);
        setFilesData((prev) =>
          prev.filter((file) => !targetIds.includes(file.id)),
        );
        await onDelete?.(targets);
        break;
      case "download":
        // window.location.href = `/api/download?ids=${...}`
        break;
      default:
        break;
    }
    refresh();
  };

  const dispatch = (action: string, item?: FileNode) => {
    if (action === "copy" || action === "move") {
      const targets = item ? [item] : selected;
      if (targets.length === 0) return;

      setTransferState({
        open: true,
        mode: action,
        items: targets,
        target: undefined,
      });
      return;
    }

    if (action === "new-folder" || action === "new-file") {
      const type = action === "new-folder" ? "folder" : "file";
      const tempId = `temp-${Date.now()}`;
      const defaultName =
        type === "folder"
          ? t("transfer.newFolderDefault")
          : DEFAULT_CREATE_NAMES.file;
      const newNode: FileNode = {
        id: tempId,
        name: defaultName,
        type,
        isHidden: false,
        parentId: folderId,
        updatedAt: new Date().toISOString(),
        size: type === "file" ? 0 : undefined,
      };
      setFilesData((prev) => [newNode, ...prev]);
      onCreated?.(tempId);
      setEditingEntry({
        id: tempId,
        mode: "create",
        type,
        name: defaultName,
        initialValue: defaultName,
        parentId: folderId,
      });
    } else if (action === "rename") {
      const target = item || selected[0];
      if (target)
        setEditingEntry({
          id: target.id,
          mode: "rename",
          type: target.type === "folder" ? "folder" : "file",
          name: target.name,
          initialValue: target.name,
          parentId: target.parentId,
        });
    } else if (action === "edit") {
      const target = item || selected[0];
      if (target) onEdit?.(target);
    } else {
      executeDirectAction(action, item);
    }
  };

  const setEditingName = (name: string) => {
    setEditingEntry((prev) => (prev ? { ...prev, name } : prev));
  };

  const cancelEditing = () => {
    if (!editingEntry) return;

    if (editingEntry.mode === "create") {
      setFilesData((prev) => prev.filter((file) => file.id !== editingEntry.id));
    }

    setEditingEntry(null);
    setEditingSelectKey(0);
    refresh();
  };

  const confirmEditing = async () => {
    if (!editingEntry) return;

    const name = editingEntry.name.trim();
    if (!name) {
      cancelEditing();
      return;
    }

    const { mode, type, id } = editingEntry;
    if (mode === "create") {
      let created;
      try {
        created = await onCreate?.({
          name,
          type,
          parentId: folderId,
        });
      } catch (error) {
        setEditingSelectKey((prev) => prev + 1);
        return;
      }

      setFilesData((prev) =>
        prev.map((file) =>
          file.id === id
            ? {
                ...file,
                id: created?.id ?? file.id,
                name: created?.name ?? name,
                type: created?.type ?? type,
                parentId: created?.parentId ?? folderId,
              }
            : file,
        ),
      );
    } else {
      try {
        await onRename?.({
          id,
          name,
          type,
          parentId: editingEntry.parentId ?? folderId,
        });
      } catch (error) {
        setEditingSelectKey((prev) => prev + 1);
        return;
      }
      setFilesData((prev) =>
        prev.map((file) => (file.id === id ? { ...file, name } : file)),
      );
    }
    setEditingEntry(null);
    setEditingSelectKey(0);
    refresh();
  };

  const closeTransfer = () => {
    setTransferState({ open: false, mode: null, items: [], target: undefined });
  };

  const setTransferTarget = (target?: TransferTarget) => {
    setTransferState((prev) => ({ ...prev, target }));
  };

  const confirmTransfer = async () => {
    const destination = transferState.target;
    if (!transferState.mode || !destination || transferState.items.length === 0) {
      return;
    }

    if (transferState.mode === "copy") {
      await onCopy?.({
        entries: transferState.items,
        destination,
      });
    } else {
      await onMove?.({
        entries: transferState.items,
        destination,
      });
    }

    closeTransfer();
    refresh();
  };

  return {
    dispatch,
    editingEntry,
    editingSelectKey,
    setEditingName,
    confirmEditing,
    cancelEditing,
    transferState,
    setTransferTarget,
    confirmTransfer,
    closeTransfer,
  };
}
