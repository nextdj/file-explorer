# @nextdj/file-explorer

A React file explorer component designed for app-side integration.

Localized docs:

- [简体中文](./README.zh-CN.md)
- [日本語](./README.ja.md)
- [한국어](./README.ko.md)

It supports:

- grid and list views
- breadcrumbs
- toolbars
- transfer dialogs for copy and move
- uploads
- context menus
- app-side callbacks for create, rename, delete, copy, and move
- configurable header visibility
- configurable selection behavior
- custom list columns with custom sorting

Live demo:

- [https://file-explorer-demo.vercel.app/](https://file-explorer-demo.vercel.app/)

![File Explorer Demo](https://raw.githubusercontent.com/i-dj/file-explorer/main/packages/file-explorer/assets/demo.png)

## Install

### Step 1: Install the package

If your project uses `pnpm`:

```bash
pnpm add @nextdj/file-explorer
```

If your project uses `npm`:

```bash
npm install @nextdj/file-explorer
```

If your project uses `yarn`:

```bash
yarn add @nextdj/file-explorer
```

### Step 2: Import styles

Add this to your global stylesheet:

```css
@import "tailwindcss";
@import "@nextdj/file-explorer/theme.css";
@source "../node_modules/@nextdj/file-explorer/dist/**/*.js";
```

This tells Tailwind to scan the package and include the classes used by the component.

### Step 3: Render the component

```tsx
import { FileExplorer, type FileExplorerData } from "@nextdj/file-explorer";

const data: FileExplorerData = {
  breadcrumbs: [{ id: "root", name: "Home" }],
  files: [
    {
      id: "folder-1",
      name: "Design",
      type: "folder",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "file-1",
      name: "brand-guidelines.pdf",
      type: "file",
      size: 1843200,
      extension: "pdf",
      updatedAt: new Date().toISOString(),
      mimeType: "application/pdf",
      mediaType: "file",
    },
  ],
};

export default function Page() {
  return <FileExplorer data={data} />;
}
```

## Smallest Working Example

Use this first if you only want to confirm the component renders correctly:

```tsx
import { FileExplorer, type FileExplorerData } from "@nextdj/file-explorer";

const data: FileExplorerData = {
  breadcrumbs: [{ id: "root", name: "Home" }],
  files: [
    {
      id: "folder-1",
      name: "Projects",
      type: "folder",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "file-1",
      name: "readme.txt",
      type: "file",
      size: 1024,
      extension: "txt",
      updatedAt: new Date().toISOString(),
      mimeType: "text/plain",
      mediaType: "file",
    },
  ],
};

export default function Page() {
  return <FileExplorer data={data} />;
}
```

## Common Example

This example includes open, folder navigation, create, rename, delete, move, and copy:

```tsx
import {
  FileExplorer,
  type FileExplorerData,
  type TransferDataSource,
} from "@nextdj/file-explorer";

const data: FileExplorerData = {
  breadcrumbs: [{ id: "root", name: "Home" }],
  files: [],
};

const dataSource: TransferDataSource[] = [
  {
    id: "local",
    name: "Local Documents",
    list: [{ id: "local", name: "Local Documents" }],
  },
  {
    id: "cloud",
    name: "My Cloud Drive",
    list: [{ id: "cloud", name: "My Cloud Drive" }],
  },
];

export default function Page() {
  return (
    <FileExplorer
      data={data}
      onOpen={(file) => {
        console.log("open file", file);
      }}
      onOpenFolder={(folder) => {
        console.log("open folder", folder);
      }}
      onNavigateBreadcrumb={(item) => {
        console.log("breadcrumb", item);
      }}
      onCreate={async ({ name, type, parentId, source }) => {
        console.log("create", { name, type, parentId, source });

        return {
          id: `created-${Date.now()}`,
          name,
          type,
          parentId,
        };
      }}
      onRename={async ({ id, name }) => {
        console.log("rename", { id, name });
      }}
      onDelete={async (entries) => {
        console.log("delete", entries);
      }}
      onCopy={async ({ entries, destination }) => {
        console.log("copy", { entries, destination });
      }}
      onMove={async ({ entries, destination }) => {
        console.log("move", { entries, destination });
      }}
      dataSource={dataSource}
      loadDataSourceFolder={async (source, target) => {
        console.log("load data source folder", { source, target });

        return {
          breadcrumbs: [{ id: target.id, name: target.name }],
          files: [],
        };
      }}
    />
  );
}
```

## Callback Example

This example focuses on the most common app-side callbacks:

```tsx
<FileExplorer
  data={data}
  onOpen={(file) => {
    console.log("open file", file);
  }}
  onOpenFolder={(folder) => {
    console.log("open folder", folder);
  }}
  onNavigateBreadcrumb={(item) => {
    console.log("navigate breadcrumb", item);
  }}
  onCreate={async ({ name, type, parentId, source }) => {
    console.log("create", { name, type, parentId, source });
    return {
      id: `created-${Date.now()}`,
      name,
      type,
      parentId,
    };
  }}
  onRename={async ({ id, name }) => {
    console.log("rename", { id, name });
  }}
  onDelete={async (entries) => {
    console.log("delete", entries);
  }}
  onCopy={async ({ entries, destination }) => {
    console.log("copy", { entries, destination });
  }}
  onMove={async ({ entries, destination }) => {
    console.log("move", { entries, destination });
  }}
/>
```

## Selection and Grid Size

You can disable multi-select, choose a grid size, apply a global font size, and control the theme:

```tsx
<FileExplorer
  data={data}
  allowMultiSelect={false}
  gridSize="lg"
  fontSize="sm"
  theme="dark"
/>
```

When `allowMultiSelect={false}`, the component disables:

- Shift range selection
- Cmd/Ctrl multi-selection
- drag-to-select

`gridSize` supports:

- `"sm"`
- `"md"`
- `"lg"`

`fontSize` supports:

- `"sm"`
- `"md"`
- `"lg"`

`theme` supports:

- `"auto"`
- `"light"`
- `"dark"`

## View Mode and Sorting

You can provide defaults:

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  defaultSortField="updatedAt"
  defaultSortDirection="desc"
/>
```

You can also fully control view mode and sorting from the app:

```tsx
const [viewMode, setViewMode] = useState<"grid" | "list">("list");
const [sortField, setSortField] = useState("updatedAt");
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

<FileExplorer
  data={data}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  sortField={sortField}
  sortDirection={sortDirection}
  onSortChange={(field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  }}
/>
```

## Custom List Columns

You can append custom columns to the built-in list view columns.

Example: add a sortable `Deleted time` column:

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  listColumns={[
    {
      key: "deletedAt",
      label: "Deleted time",
      width: "180px",
      sortable: true,
      render: (_, record) => record.metadata?.deletedAt ?? "--",
      sortValue: (record) =>
        record.metadata?.deletedAt
          ? new Date(record.metadata.deletedAt).getTime()
          : 0,
    },
  ]}
/>
```

Notes:

- Custom columns are appended after the built-in columns and before the action column.
- If `sortable` is `true`, provide `sortValue(record)` for custom fields that do not exist directly on `FileNode`.
- Built-in columns such as `name`, `type`, `size`, and `updatedAt` continue to work as before.

If you want full control over the built-in columns, use `getListColumns` instead.

Example: hide `size`, move `updatedAt`, and add a custom `Deleted time` column:

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  getListColumns={(defaultColumns) => {
    const name = defaultColumns.find((col) => col.key === "name")!;
    const type = defaultColumns.find((col) => col.key === "type")!;
    const updatedAt = defaultColumns.find((col) => col.key === "updatedAt")!;
    const actions = defaultColumns.find((col) => col.key === "__actions__")!;

    return [
      name,
      {
        key: "deletedAt",
        label: "Deleted time",
        width: "180px",
        sortable: true,
        render: (_, record) => record.metadata?.deletedAt ?? "--",
        sortValue: (record) =>
          record.metadata?.deletedAt
            ? new Date(record.metadata.deletedAt).getTime()
            : 0,
      },
      type,
      updatedAt,
      actions,
    ];
  }}
/>
```

The built-in action column is also part of `defaultColumns`. Its key is `__actions__`, so you can remove it, move it, or replace it.

Example: remove the action column completely:

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  getListColumns={(defaultColumns) =>
    defaultColumns.filter((col) => col.key !== "__actions__")
  }
/>
```

Example: replace the action column with your own button:

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  getListColumns={(defaultColumns) =>
    defaultColumns.map((col) =>
      col.key === "__actions__"
        ? {
            ...col,
            width: "120px",
            render: (_, record) => (
              <button onClick={() => console.log("custom action", record)}>
                Custom
              </button>
            ),
          }
        : col,
    )
  }
/>
```

## UI Visibility Controls

You can directly control the top area:

```tsx
<FileExplorer
  data={data}
  showBreadcrumbs={true}
  showToolbar={true}
  viewControls={{
    showDisplayButton: true,
    showViewToggleButton: true,
    showSortOptions: true,
    showSortDirectionOptions: true,
    showHiddenFileOptions: true,
    showTagFilterOption: true,
  }}
/>
```

## Features

Use `features` to enable or disable built-in actions:

```tsx
<FileExplorer
  data={data}
  features={{
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
  }}
/>
```

If a feature is `false`, related actions are hidden from toolbars and context menus.

## Data Shape

### `FileNode`

```ts
type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId?: string;
  size?: number;
  extension?: string;
  updatedAt: string;
  isHidden?: boolean;
  mimeType?: string;
  mediaType?: "image" | "video" | "file" | string;
  metadata?: Record<string, any>;
  tagColors?: ("red" | "blue" | "green" | "yellow" | "gray")[];
};
```

### `FileExplorerData`

```ts
type FileExplorerData = {
  breadcrumbs: { id: string; name: string }[];
  files: FileNode[];
};
```

### `TransferDataSource`

```ts
type TransferDataSource = {
  id: string;
  name: string;
  list: TransferTarget[];
};
```

### `TransferTarget`

```ts
type TransferTarget = {
  id: string;
  name: string;
  folderId?: string;
  parentId?: string;
  children?: TransferTarget[];
};
```

### `FileListColumn`

```ts
type FileListColumn = {
  key: keyof FileNode | string | "__actions__";
  label: React.ReactNode;
  width?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: any, record: FileNode) => React.ReactNode;
  sortValue?: (
    record: FileNode,
  ) => string | number | Date | null | undefined;
};
```

## Core Props

| Prop | Type | Notes |
| --- | --- | --- |
| `data` | `FileExplorerData` | Main input. Recommended. |
| `files` | `FileNode[]` | Legacy split input. |
| `breadcrumbs` | `BreadcrumbItem[]` | Legacy split input. |
| `storageInfo` | `{ totalBytes?: number; availableBytes?: number }` | Shows capacity text below the header. |
| `fontSize` | `"sm" \| "md" \| "lg"` | Global font scale for the component. Default is `"md"`. |
| `theme` | `"auto" \| "light" \| "dark"` | Theme mode. Default is `"auto"`. |
| `lang` | `string` | Sets locale. |
| `dateFormat` | `string` | Controls formatted date output. |
| `renderPreview` | `(file) => ReactNode` | Custom preview renderer for grid items. |
| `renderDetail` | `(file) => ReactNode` | Custom detail panel content. |

## View and Selection Props

| Prop | Type | Notes |
| --- | --- | --- |
| `allowMultiSelect` | `boolean` | Defaults to `true`. |
| `gridSize` | `"sm" \| "md" \| "lg"` | Grid density. Default is `"md"`. |
| `defaultViewMode` | `"grid" \| "list"` | Initial view mode. |
| `viewMode` | `"grid" \| "list"` | Controlled view mode. |
| `onViewModeChange` | `(mode) => void` | Called when view mode changes. |
| `defaultSortField` | `keyof FileNode \| string` | Initial sort field. |
| `defaultSortDirection` | `"asc" \| "desc"` | Initial sort direction. |
| `sortField` | `keyof FileNode \| string` | Controlled sort field. |
| `sortDirection` | `"asc" \| "desc"` | Controlled sort direction. |
| `onSortChange` | `(field, direction) => void` | Called when sorting changes. |
| `listColumns` | `FileListColumn[]` | Appends custom list columns. |
| `getListColumns` | `(defaultColumns) => FileListColumn[]` | Full control over built-in list columns. |

## Header and Feature Props

| Prop | Type | Notes |
| --- | --- | --- |
| `showBreadcrumbs` | `boolean` | Controls breadcrumb visibility. |
| `showToolbar` | `boolean` | Controls center toolbar visibility. |
| `viewControls` | `FileExplorerViewControls` | Controls right-side buttons and menu sections. |
| `toolbarStyle` | `"default" \| "floating" \| "transparent"` | Header style. |
| `features` | `FileExplorerFeatures` | Enables or disables built-in actions. |
| `uploadOptions` | `FileExplorerUploadOptions` | Configures Uppy upload behavior. |
| `onUploadStateChange` | `(snapshot) => void` | Observe upload progress. |

## Transfer Dialog Props

| Prop | Type | Notes |
| --- | --- | --- |
| `dataSource` | `TransferDataSource[]` | Transfer dialog tabs and root targets. |
| `loadDataSourceFolder` | `(source, target) => Promise<FileExplorerData>` | Lazy-load folders inside the transfer dialog. |

## Callback Props

| Prop | Type | Notes |
| --- | --- | --- |
| `onOpen` | `(file) => void` | Called when opening a file. |
| `onOpenFolder` | `(folder) => void` | Called when opening a folder. |
| `onNavigateBreadcrumb` | `(item) => void` | Called when clicking a breadcrumb. |
| `onTagColorsChange` | `(file, colors) => void` | Called when tag colors change. |
| `onCreate` | `(payload) => Promise<{ id; name; type; parentId? } \| void> \| { id; name; type; parentId? } \| void` | Handles create in explorer and transfer dialog. |
| `onRename` | `(payload) => void \| Promise<void>` | Handles rename. |
| `onDelete` | `(entries) => void \| Promise<void>` | Handles delete or move to trash. |
| `onCopy` | `({ entries, destination }) => void \| Promise<void>` | Handles copy confirm. |
| `onMove` | `({ entries, destination }) => void \| Promise<void>` | Handles move confirm. |
| `appendContextMenuItems` | `(file) => FileContextMenuItem[]` | Appends extra context menu items. |
| `hideContextMenuActions` | `(file) => FileContextMenuActionId[]` | Hides built-in context menu items. |
| `replaceContextMenuActions` | `(file) => Partial<Record<FileContextMenuActionId, FileContextMenuItem>>` | Replaces built-in context menu items. |
| `getContextMenuItems` | `(file, defaultItems) => FileContextMenuItem[]` | Full low-level context menu override. |

## `viewControls`

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `showDisplayButton` | `boolean` | `true` | Shows or hides the display button on the right. |
| `showViewToggleButton` | `boolean` | `true` | Shows or hides the grid/list view toggle. |
| `showSortOptions` | `boolean` | `true` | Shows or hides sort-by items in the display menu. |
| `showSortDirectionOptions` | `boolean` | `true` | Shows or hides ascending/descending items. |
| `showHiddenFileOptions` | `boolean` | `true` | Shows or hides hidden-file controls. |
| `showTagFilterOption` | `boolean` | `true` | Shows or hides the tag filter section inside the display menu. |

## `features`

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `uploadFile` | `boolean` | `true` | Show upload-file action. |
| `uploadFolder` | `boolean` | `true` | Show upload-folder action. |
| `newFolder` | `boolean` | `true` | Show create-folder action. |
| `newFile` | `boolean` | `true` | Show create-text-file action. |
| `preview` | `boolean` | `true` | Show open or preview action. |
| `detail` | `boolean` | `true` | Show detail or edit action. |
| `download` | `boolean` | `true` | Show download action. |
| `move` | `boolean` | `true` | Show move action. |
| `copy` | `boolean` | `true` | Show copy action. |
| `rename` | `boolean` | `true` | Show rename action. |
| `delete` | `boolean` | `true` | Show delete action. |
| `tagFilter` | `boolean` | `true` | Show tag-filter-related UI. |

## Important Notes

- This component is a UI layer, not a storage SDK.
- Your app is responsible for loading data, creating folders, renaming files, deleting entries, and handling uploads.
- In transfer dialogs, `source.id` is usually the storage or location id.
- In `onCreate`, the `source` field is present only when the create action comes from the transfer dialog.
