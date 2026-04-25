import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Copy,
  Download,
  Edit,
  Eye,
  Fan,
  FolderInput,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

export type FileExplorerLocale =
  | "en"
  | "zh-CN"
  | "zh-TW"
  | "ja"
  | "ko"
  | "fr"
  | "de"
  | "es"
  | "pt-BR"
  | "ru";

export type FileExplorerTranslate = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

export type CategoryColor = "red" | "blue" | "green" | "yellow" | "gray";

export interface FileCategoryColor {
  hex: string;
  label: string;
  bgClass: string;
}
export interface FileNode {
  // --- Identity ---
  id: string;
  name: string;
  type: "file" | "folder"; // Keep literal types to avoid leaking enum dependencies.
  parentId?: string;
  // --- UI-facing core fields ---
  size?: number; // Store file size in bytes.
  extension?: string; // Extension without the dot, for example `pdf`.
  updatedAt: string; // Prefer ISO strings and let the UI handle formatting.
  isHidden?: boolean;
  mimeType?: string;
  mediaType?: "image" | "video" | "file" | string;
  metadata?: Record<string, any>;
  tagColors?: CategoryColor[];
}

export type FileViewMode = "grid" | "list";
export type FileSortDirection = "asc" | "desc";
export type FileSortField = keyof FileNode | string;

export interface FileListColumn {
  key: FileSortField | "__actions__";
  label: ReactNode;
  width?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: any, record: FileNode) => ReactNode;
  sortValue?: (record: FileNode) => string | number | Date | null | undefined;
}

export interface FileContextMenuItem {
  label?: ReactNode;
  action?: string;
  icon?: LucideIcon | ReactNode;
  className?: string;
  disabled?: boolean;
  separator?: boolean;
  isHeader?: boolean;
  checked?: boolean;
  isDelete?: boolean;
  render?: (helpers: { closeMenu: () => void }, file: FileNode) => ReactNode;
  onSelect?: (file: FileNode) => void | Promise<void>;
}

export type FileContextMenuActionId = FileAction;

export interface FileExplorerFeatures {
  uploadFile?: boolean;
  uploadFolder?: boolean;
  newFolder?: boolean;
  newFile?: boolean;
  preview?: boolean;
  detail?: boolean;
  download?: boolean;
  move?: boolean;
  copy?: boolean;
  rename?: boolean;
  delete?: boolean;
  tagFilter?: boolean;
}

export interface FileExplorerViewControls {
  showDisplayButton?: boolean;
  showViewToggleButton?: boolean;
  showSortOptions?: boolean;
  showSortDirectionOptions?: boolean;
  showHiddenFileOptions?: boolean;
  showTagFilterOption?: boolean;
}

export type FileUploadStatus =
  | "queued"
  | "uploading"
  | "paused"
  | "complete"
  | "error"
  | "canceled";

export interface FileUploadItem {
  id: string;
  name: string;
  relativePath?: string;
  targetFolderId?: string;
  targetFolderName?: string;
  targetPath?: string;
  progress: number;
  size?: number;
  status: FileUploadStatus;
}

export interface FileUploadSummary {
  totalProgress: number;
  totalBytes: number;
  uploadedBytes: number;
  totalDurationSeconds: number;
  fileCount: number;
  activeCount: number;
  completedCount: number;
  errorCount: number;
}

export interface FileUploadSnapshot {
  files: FileUploadItem[];
  summary: FileUploadSummary;
}

export interface FileExplorerUploadOptions {
  endpoint?: string;
  headers?: Record<string, string>;
  metadata?: Record<string, string>;
  withCredentials?: boolean;
  autoProceed?: boolean;
  chunkSize?: number;
  retryDelays?: number[];
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export interface FileExplorerProps {
  data?: FileExplorerData;
  files?: FileNode[];
  breadcrumbs?: BreadcrumbItem[];
  storageInfo?: FileExplorerStorageInfo;
  allowMultiSelect?: boolean;
  gridSize?: "sm" | "md" | "lg";
  defaultViewMode?: FileViewMode;
  viewMode?: FileViewMode;
  onViewModeChange?: (mode: FileViewMode) => void;
  defaultSortField?: FileSortField;
  defaultSortDirection?: FileSortDirection;
  sortField?: FileSortField;
  sortDirection?: FileSortDirection;
  onSortChange?: (field: FileSortField, direction: FileSortDirection) => void;
  listColumns?: FileListColumn[];
  showBreadcrumbs?: boolean;
  showToolbar?: boolean;
  viewControls?: FileExplorerViewControls;
  transferTargets?: TransferTarget[];
  dataSource?: TransferDataSource[];
  loadDataSourceFolder?: (
    source: TransferDataSource,
    target: TransferTarget,
  ) => Promise<FileExplorerData>;
  features?: FileExplorerFeatures;
  lang?: string;
  dateFormat?: string;
  /**
   * Toolbar style variants:
   * - "default": regular solid header
   * - "floating": floating card-style header
   * - "transparent": translucent header
   */
  toolbarStyle?: "default" | "floating" | "transparent";
  renderPreview?: (file: FileNode) => React.ReactNode | undefined;
  renderDetail?: (file: FileNode) => React.ReactNode | undefined;
  onOpen?: (file: FileNode) => void;
  onOpenFolder?: (folder: FileNode) => void;
  onNavigateBreadcrumb?: (item: BreadcrumbItem) => void;
  onTagColorsChange?: (file: FileNode, colors: CategoryColor[]) => void;
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
    | Promise<{
        id: string;
        name: string;
        type: FileNode["type"];
        parentId?: string;
      } | void>;
  onRename?: (entry: {
    id: string;
    name: string;
    type: FileNode["type"];
    parentId?: string;
  }) => void | Promise<void>;
  onDelete?: (entries: FileNode[]) => void | Promise<void>;
  onCopy?: (payload: {
    entries: FileNode[];
    destination: TransferTarget;
  }) => void | Promise<void>;
  onMove?: (payload: {
    entries: FileNode[];
    destination: TransferTarget;
  }) => void | Promise<void>;
  uploadOptions?: FileExplorerUploadOptions;
  onUploadStateChange?: (snapshot: FileUploadSnapshot) => void;
  appendContextMenuItems?: (file: FileNode) => FileContextMenuItem[];
  hideContextMenuActions?: (file: FileNode) => FileContextMenuActionId[];
  replaceContextMenuActions?: (
    file: FileNode,
  ) => Partial<Record<FileContextMenuActionId, FileContextMenuItem>>;
  getContextMenuItems?: (
    file: FileNode,
    defaultItems: FileContextMenuItem[],
  ) => FileContextMenuItem[];
}

export interface FileExplorerData {
  breadcrumbs: BreadcrumbItem[];
  files: FileNode[];
}

export interface FileExplorerStorageInfo {
  totalBytes?: number;
  availableBytes?: number;
}

export interface TransferTarget {
  id: string;
  name: string;
  icon?: LucideIcon | ReactNode;
  folderId?: string;
  parentId?: string;
  children?: TransferTarget[];
}

export interface TransferDataSource {
  id: string;
  name: string;
  icon?: LucideIcon | ReactNode;
  list: TransferTarget[];
}

export type ToolbarStyle = NonNullable<FileExplorerProps["toolbarStyle"]>;

export type FileEntryMode = "create" | "rename";
export type FileEntryType = "file" | "folder";

export const FILE_ACTION_META = {
  preview: {
    labelKey: "action.open",
    icon: Eye,
    isDelete: false,
    requiresSingle: false,
    separator: false,
  },
  download: {
    labelKey: "action.download",
    icon: Download,
    isDelete: false,
    requiresSingle: false,
    separator: true,
  },
  edit: {
    labelKey: "action.detail",
    icon: Edit,
    isDelete: false,
    requiresSingle: false,
    separator: true,
  },

  copy: {
    labelKey: "action.copy",
    icon: Copy,
    isDelete: false,
    requiresSingle: false,
    separator: false,
  },
  move: {
    labelKey: "action.move",
    icon: FolderInput,
    isDelete: false,
    requiresSingle: false,
    separator: false,
  },

  rename: {
    labelKey: "action.rename",
    icon: Pencil,
    isDelete: false,
    requiresSingle: true,
    separator: true,
  },

  delete: {
    labelKey: "action.delete",
    icon: Trash2,
    isDelete: true,
    requiresSingle: false,
    separator: false,
  },
} as const;

export type FileAction = keyof typeof FILE_ACTION_META;

export const getRowMoreActions = (t: FileExplorerTranslate) =>
  Object.entries(FILE_ACTION_META)
  .filter(([id]) => id !== "more")
  .map(([id, config]) => ({
    label: t(config.labelKey),
    action: id as FileAction,
    icon: config.icon,
    separator: config.separator,
    isDelete: config.isDelete,
  }));

export const getToolbarActions = (t: FileExplorerTranslate) => Object.entries(FILE_ACTION_META).map(
  ([id, { labelKey, ...config }]) => ({
    id: id as FileAction,
    label: t(labelKey),
    ...config,
  }),
);

export interface FileViewProps {
  onAction: (action: FileAction, item: FileNode) => void;
  items: FileNode[]; // Currently rendered subset, such as only folders or only files.
  allData: FileNode[]; // Fully sorted list used for index calculations.
  selected: FileNode[]; // Mirrors the object-array shape returned by the selection hook.
  isSelected: (item: FileNode) => boolean;
  onItemClick: (e: React.MouseEvent, item: FileNode, index: number) => void;
  onSortAction?: (key: FileSortField) => void;
  sortConfig?: { key: FileSortField; dir: FileSortDirection };
  newlyCreatedId?: string | null;
  editingItemId?: string | null;
  editingName?: string;
  editingSelectKey?: number;
  onEditingNameChange?: (value: string) => void;
  onEditingNameSubmit?: () => void;
  onEditingNameCancel?: () => void;
  onDoubleClick: (item: FileNode) => void;
  onTagColorsChange?: (item: FileNode, colors: CategoryColor[]) => void;
}
export interface BreadcrumbItem {
  id: string;
  name: string;
}
