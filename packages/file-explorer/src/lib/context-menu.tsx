import type { ActionMenuConfig } from "../components/ActionMenu";
import { ColorMultiSelect } from "../components/ColorMultiSelect";
import {
  CategoryColor,
  FileExplorerTranslate,
  FileContextMenuActionId,
  FileContextMenuItem,
  FileNode,
  getRowMoreActions,
} from "../types";

export function buildDefaultContextMenuItems(
  file: FileNode,
  onTagColorsChange?: (item: FileNode, colors: CategoryColor[]) => void,
  options?: {
    t: FileExplorerTranslate;
    preview?: boolean;
    detail?: boolean;
    download?: boolean;
    move?: boolean;
    copy?: boolean;
    rename?: boolean;
    delete?: boolean;
    tagFilter?: boolean;
  },
): FileContextMenuItem[] {
  const actionItems = getRowMoreActions(options?.t ?? ((key) => key));
  const actionVisible = {
    preview: options?.preview ?? true,
    edit: options?.detail ?? true,
    download: options?.download ?? true,
    move: options?.move ?? true,
    copy: options?.copy ?? true,
    rename: options?.rename ?? true,
    delete: options?.delete ?? true,
  };

  const items: FileContextMenuItem[] = actionItems.filter((item) => {
    if (item.action === "preview") return actionVisible.preview;
    if (item.action === "download") return actionVisible.download;
    if (item.action === "move") return actionVisible.move;
    if (item.action === "copy") return actionVisible.copy;
    if (item.action === "rename") return actionVisible.rename;
    if (item.action === "delete") return actionVisible.delete;
    if (item.action === "edit") return actionVisible.edit;
    return true;
  });

  if (options?.tagFilter === false) {
    return items;
  }

  return [
    ...items,
    { label: options?.t?.("toolbar.tagFilter") ?? "Tag filter", isHeader: true },
    {
      label: options?.t?.("toolbar.colorMultiSelect") ?? "Color filter",
      render: (_helpers, target) => (
        <div className="px-1 py-1">
          <ColorMultiSelect
            mode="tag"
            selected={target.tagColors ?? []}
            onChange={(colors) => onTagColorsChange?.(target, colors)}
          />
        </div>
      ),
    },
  ];
}

export function composeContextMenuItems(
  file: FileNode,
  defaultItems: FileContextMenuItem[],
  options?: {
    hideActions?: FileContextMenuActionId[];
    replaceActions?: Partial<Record<FileContextMenuActionId, FileContextMenuItem>>;
    appendItems?: FileContextMenuItem[];
    getContextMenuItems?: (
      file: FileNode,
      defaultItems: FileContextMenuItem[],
    ) => FileContextMenuItem[];
  },
): FileContextMenuItem[] {
  const hidden = new Set(options?.hideActions ?? []);
  const replaced = options?.replaceActions ?? {};

  const mergedDefaults = defaultItems
    .filter((item) => !item.action || !hidden.has(item.action as FileContextMenuActionId))
    .map((item) => {
      if (!item.action) return item;
      const replacement = replaced[item.action as FileContextMenuActionId];
      return replacement ? { ...item, ...replacement, action: item.action } : item;
    });

  const appendedItems = options?.appendItems ?? [];
  const withAppended =
    appendedItems.length > 0
      ? (() => {
          const deleteIndex = mergedDefaults.findIndex(
            (item) => item.action === "delete",
          );

          if (deleteIndex === -1) {
            return [...mergedDefaults, { separator: true }, ...appendedItems];
          }

          return [
            ...mergedDefaults.slice(0, deleteIndex + 1),
            { separator: true },
            ...appendedItems,
            ...mergedDefaults.slice(deleteIndex + 1),
          ];
        })()
      : mergedDefaults;

  if (options?.getContextMenuItems) {
    return options.getContextMenuItems(file, withAppended);
  }

  return withAppended;
}

export function resolveContextMenuItems(
  file: FileNode,
  items: FileContextMenuItem[],
): ActionMenuConfig[] {
  return items.map((item) => ({
    ...item,
    render: item.render
      ? (helpers) => item.render?.(helpers, file)
      : undefined,
    onSelect: item.onSelect ? () => item.onSelect?.(file) : undefined,
  }));
}
