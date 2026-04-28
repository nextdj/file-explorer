import { createContext, useContext } from "react";
import { createTranslator } from "./lib/i18n";
import {
  BreadcrumbItem,
  CategoryColor,
  FileContextMenuItem,
  FileContextMenuActionId,
  FileNode,
  FileExplorerFeatures,
  FileListColumn,
  FileExplorerLocale,
  FileExplorerStorageInfo,
  FileExplorerViewControls,
  FileExplorerFontSize,
  FileExplorerTheme,
  FileSortDirection,
  FileSortField,
  FileViewMode,
  TransferDataSource,
  TransferTarget,
  ToolbarStyle,
} from "./types";

interface FileExplorerContextValue {
  lang: FileExplorerLocale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dateFormat: string;
  breadcrumbs?: BreadcrumbItem[];
  storageInfo?: FileExplorerStorageInfo;
  fontSize: FileExplorerFontSize;
  theme: FileExplorerTheme;
  allowMultiSelect: boolean;
  gridSize: "sm" | "md" | "lg";
  defaultViewMode: FileViewMode;
  viewMode?: FileViewMode;
  onViewModeChange?: (mode: FileViewMode) => void;
  defaultSortField: FileSortField;
  defaultSortDirection: FileSortDirection;
  sortField?: FileSortField;
  sortDirection?: FileSortDirection;
  onSortChange?: (field: FileSortField, direction: FileSortDirection) => void;
  listColumns?: FileListColumn[];
  getListColumns?: (defaultColumns: FileListColumn[]) => FileListColumn[];
  showBreadcrumbs: boolean;
  showToolbar: boolean;
  viewControls: Required<FileExplorerViewControls>;
  transferTargets?: TransferTarget[];
  dataSource?: TransferDataSource[];
  loadDataSourceFolder?: (
    source: TransferDataSource,
    target: TransferTarget,
  ) => Promise<{
    breadcrumbs: BreadcrumbItem[];
    files: FileNode[];
  }>;
  features: Required<FileExplorerFeatures>;
  renderPreview?: (file: FileNode) => React.ReactNode | undefined;
  renderDetail?: (file: FileNode) => React.ReactNode | undefined;
  toolbarStyle: ToolbarStyle;
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
    | Promise<
        | {
            id: string;
            name: string;
            type: FileNode["type"];
            parentId?: string;
          }
        | void
      >;
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
  openFileDetail: (file: FileNode) => void;
  closeFileDetail: () => void;
  openUploadDialog: () => void;
  closeUploadDialog: () => void;
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

export const FileExplorerContext = createContext<FileExplorerContextValue>({
  lang: "en",
  t: createTranslator("en"),
  dateFormat: "YYYY/M/D HH:mm:ss",
  fontSize: "md",
  theme: "auto",
  allowMultiSelect: true,
  gridSize: "md",
  defaultViewMode: "grid",
  defaultSortField: "name",
  defaultSortDirection: "asc",
  features: {
    uploadFile: true,
    uploadFolder: true,
    newFolder: true,
    newFile: true,
    preview: true,
    detail: true,
    download: true,
    move: true,
    copy: true,
    rename: true,
    delete: true,
    tagFilter: true,
  },
  showBreadcrumbs: true,
  showToolbar: true,
  viewControls: {
    showDisplayButton: true,
    showViewToggleButton: true,
    showSortOptions: true,
    showSortDirectionOptions: true,
    showHiddenFileOptions: true,
    showTagFilterOption: true,
  },
  toolbarStyle: "default",
  openFileDetail: () => undefined,
  closeFileDetail: () => undefined,
  openUploadDialog: () => undefined,
  closeUploadDialog: () => undefined,
});

export const useFileExplorerContext = () => useContext(FileExplorerContext);
