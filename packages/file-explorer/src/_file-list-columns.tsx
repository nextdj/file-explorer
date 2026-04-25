import { Folder, MoreVertical } from "lucide-react";
import {
  CategoryColor,
  FileExplorerFeatures,
  FileAction,
  FileListColumn,
  FileNode,
} from "./types";
import {
  ActionMenu,
  Button,
  ColorTags,
  type DataTableHeader,
} from "./components";
import { InlineNameInput } from "./components/InlineNameInput";
import {
  buildDefaultContextMenuItems,
  bytesFormat,
  cn,
  composeContextMenuItems,
  formatDateTime,
  resolveContextMenuItems,
} from "./lib";
import { getFileCategoryLabel, getFileConfig } from "./lib/file-utils";
import { FileContextMenuActionId, FileContextMenuItem } from "./types";

export const getFileListColumns = (
  onAction: (action: FileAction, item: FileNode) => void,
  onTagColorsChange?: (item: FileNode, colors: CategoryColor[]) => void,
  editing?: {
    editingItemId?: string | null;
    editingName?: string;
    editingSelectKey?: number;
    onEditingNameChange?: (value: string) => void;
    onEditingNameSubmit?: () => void;
    onEditingNameCancel?: () => void;
  },
  appendContextMenuItems?: (file: FileNode) => FileContextMenuItem[],
  hideContextMenuActions?: (file: FileNode) => FileContextMenuActionId[],
  replaceContextMenuActions?: (
    file: FileNode,
  ) => Partial<Record<FileContextMenuActionId, FileContextMenuItem>>,
  features?: Required<FileExplorerFeatures>,
  getContextMenuItems?: (
    file: FileNode,
    defaultItems: FileContextMenuItem[],
  ) => FileContextMenuItem[],
  customColumns: FileListColumn[] = [],
  locale?: string,
  t: (key: string, vars?: Record<string, string | number>) => string = (key) =>
    key,
): DataTableHeader<FileNode>[] => {
  const customListColumns: DataTableHeader<FileNode>[] = customColumns
    .filter((column) => column.key !== "__actions__")
    .map((column) => ({
      key: column.key,
      label: column.label,
      width: column.width,
      sortable: column.sortable,
      align: column.align,
      render: column.render
        ? (value, record) => column.render?.(value, record)
        : (value, record) => (
            <span className="text-(--_fe-text-muted)">
              {value ??
                record.metadata?.[String(column.key)] ??
                "--"}
            </span>
          ),
    }));

  return [
    {
    key: "name",
    label: t("list.column.name"),
    sortable: true,

    render: (v, record) => {
      const fileVisual =
        record.type === "folder" ? null : getFileConfig(record.name, locale);

      return (
        <div className="flex w-full items-center justify-between gap-3 overflow-hidden">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {record.type === "folder" ? (
              <Folder className="h-5 w-5 text-amber-400" strokeWidth={1.8} />
            ) : (
              <div
                className={cn(
                  "flex h-7 min-w-7 items-center justify-center rounded-lg",
                  fileVisual?.bgClass,
                )}
              >
                {fileVisual && (
                  <fileVisual.Icon
                    className={cn("h-4 w-4", fileVisual.color)}
                    strokeWidth={1.9}
                  />
                )}
              </div>
            )}
            {editing?.editingItemId === record.id ? (
              <InlineNameInput
                value={editing.editingName ?? record.name}
                onChange={(value) => editing.onEditingNameChange?.(value)}
                onSubmit={() => editing.onEditingNameSubmit?.()}
                onCancel={() => editing.onEditingNameCancel?.()}
                selectKey={editing.editingSelectKey}
              />
            ) : (
              <span className="text-(--_fe-selected) truncate">
                {v}
              </span>
            )}
          </div>
          {record.tagColors && record.tagColors.length > 0 && (
            <div className="ml-auto flex shrink-0 items-center">
              <ColorTags colors={record.tagColors} size={10} />
            </div>
          )}
        </div>
      );
    },
    },

    {
      key: "type",
      label: t("list.column.type"),
      width: "120px",
      sortable: true,
      render: (_, record) => (
        <span className="text-(--_fe-text-muted)">
          {getFileCategoryLabel(record, locale)}
        </span>
      ),
    },
    {
      key: "size",
      label: t("list.column.size"),
      width: "120px",
      sortable: true,

      render: (v, record) => (
        <span className="text-(--_fe-text-muted)">
          {record.type === "folder" ? "--" : bytesFormat(v)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: t("list.column.updatedAt"),
      width: "180px",
      sortable: true,

      render: (v) => (
        <span className="text-(--_fe-text-muted)">{formatDateTime(v)}</span>
      ),
    },
    ...customListColumns,
    {
      key: "__actions__",
      label: "",
      width: "100px",
      align: "right",
      render: (_, record) => (
        <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
          {/* Quick delete */}
          <Button
            variant="ghost"
            size="sm"
            isDelete
            onClick={(e) => {
              e.stopPropagation();
              onAction("delete", record);
            }}
          />
          {/* Overflow menu */}
          <ActionMenu
            mode="left-click"
            items={resolveContextMenuItems(
              record,
              composeContextMenuItems(
                record,
                buildDefaultContextMenuItems(record, onTagColorsChange, {
                  t,
                  preview: features?.preview,
                  download: features?.download,
                  detail: features?.detail,
                  move: features?.move,
                  copy: features?.copy,
                  rename: features?.rename,
                  delete: features?.delete,
                  tagFilter: features?.tagFilter,
                }),
                {
                  appendItems: appendContextMenuItems?.(record),
                  hideActions: hideContextMenuActions?.(record),
                  replaceActions: replaceContextMenuActions?.(record),
                  getContextMenuItems,
                },
              ),
            )}
            onAction={(id) => onAction(id as FileAction, record)}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                icon={MoreVertical}
                onClick={(e) => e.stopPropagation()}
              />
            }
          />
        </div>
      ),
    },
  ];
};
