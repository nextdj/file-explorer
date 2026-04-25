# @nextdj/file-explorer

A React file explorer component for app-side integration.

It supports:

- grid and table views
- breadcrumbs
- toolbar actions
- copy / move transfer dialog
- uploads
- context menus
- app-side create / rename / delete / copy / move callbacks

Live demo:

- [https://file-explorer-demo.vercel.app/](https://file-explorer-demo.vercel.app/)

![File Explorer Demo](https://raw.githubusercontent.com/nextdj/file-explorer/main/packages/file-explorer/assets/demo.png)

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

### Step 2: Import the styles

In your global stylesheet, add:

```css
@import "tailwindcss";
@import "@nextdj/file-explorer/theme.css";
@source "../node_modules/@nextdj/file-explorer/dist/**/*.js";
```

This tells Tailwind to scan the component package and include the styles it uses.

### Step 3: Render the component

The component needs one `data` object:

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
      extension: "pdf",
      size: 1843200,
      updatedAt: new Date().toISOString(),
      mimeType: "application/pdf",
      mediaType: "file",
    },
  ],
};

export function Example() {
  return <FileExplorer data={data} />;
}
```

## Smallest Working Example

Use this first if you just want to confirm the component renders:

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
      updatedAt: new Date().toISOString(),
      size: 1024,
      extension: "txt",
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

## Props

| Prop | Type | Default | How to use |
| --- | --- | --- | --- |
| `data` | `FileExplorerData` | `undefined` | Recommended main input. Pass `{ breadcrumbs, files }`. |
| `files` | `FileNode[]` | `[]` | Legacy split input. Used when `data` is not passed. |
| `breadcrumbs` | `BreadcrumbItem[]` | `[]` | Legacy split input. Used when `data` is not passed. |
| `storageInfo` | `{ totalBytes?: number; availableBytes?: number }` | `undefined` | Shows capacity text below the header. |
| `showBreadcrumbs` | `boolean` | `true` | Controls whether the breadcrumb area is visible. |
| `showToolbar` | `boolean` | `true` | Controls whether the center primary toolbar is visible. |
| `viewControls` | `FileExplorerViewControls` | all `true` | Controls the right-side display button, view toggle, and display menu sections. |
| `toolbarStyle` | `"default" \| "floating" \| "transparent"` | `"default"` | Controls header style. |
| `features` | `FileExplorerFeatures` | all `true` | Enables or disables built-in actions. |
| `lang` | `string` | auto | Sets locale. |
| `dateFormat` | `string` | `"YYYY/M/D HH:mm:ss"` | Controls formatted date output. |
| `renderPreview` | `(file) => ReactNode` | `undefined` | Custom preview renderer for grid items. |
| `renderDetail` | `(file) => ReactNode` | `undefined` | Custom file detail panel content. |
| `onOpen` | `(file) => void` | `undefined` | Called when opening a file. |
| `onOpenFolder` | `(folder) => void` | `undefined` | Called when opening a folder in the main explorer. |
| `onNavigateBreadcrumb` | `(item) => void` | `undefined` | Called when clicking a breadcrumb. |
| `onTagColorsChange` | `(file, colors) => void` | `undefined` | Called when a file tag color changes. |
| `onCreate` | `(payload) => Promise<{ id; name; type; parentId? } \| void> \| { id; name; type; parentId? } \| void` | `undefined` | Handles create actions from both the main explorer and the transfer dialog. `source` is present only for transfer dialog creation. |
| `onRename` | `(payload) => void \| Promise<void>` | `undefined` | Handles rename. |
| `onDelete` | `(entries) => void \| Promise<void>` | `undefined` | Handles delete / move to trash. |
| `onCopy` | `({ entries, destination }) => void \| Promise<void>` | `undefined` | Handles copy confirm. |
| `onMove` | `({ entries, destination }) => void \| Promise<void>` | `undefined` | Handles move confirm. |
| `uploadOptions` | `FileExplorerUploadOptions` | `undefined` | Configures Uppy upload behavior. |
| `onUploadStateChange` | `(snapshot) => void` | `undefined` | Lets the app observe upload progress. |
| `dataSource` | `TransferDataSource[]` | `[]` | Transfer dialog tabs and root targets. |
| `loadDataSourceFolder` | `(source, target) => Promise<FileExplorerData>` | `undefined` | Loads folders lazily inside the transfer dialog. |
| `appendContextMenuItems` | `(file) => FileContextMenuItem[]` | `undefined` | Appends extra context menu items. |
| `hideContextMenuActions` | `(file) => FileContextMenuActionId[]` | `undefined` | Hides built-in context menu items. |
| `replaceContextMenuActions` | `(file) => Partial<Record<FileContextMenuActionId, FileContextMenuItem>>` | `undefined` | Replaces built-in context menu item config. |
| `getContextMenuItems` | `(file, defaultItems) => FileContextMenuItem[]` | `undefined` | Full low-level override for the context menu. |

## `viewControls`

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `showDisplayButton` | `boolean` | `true` | Shows or hides the display button on the right. |
| `showViewToggleButton` | `boolean` | `true` | Shows or hides the grid / list view toggle. |
| `showSortOptions` | `boolean` | `true` | Shows or hides sort-by items in the display menu. |
| `showSortDirectionOptions` | `boolean` | `true` | Shows or hides ascending / descending items. |
| `showHiddenFileOptions` | `boolean` | `true` | Shows or hides hidden-file controls. |
| `showTagFilterOption` | `boolean` | `true` | Shows or hides the tag filter section inside the display menu. |

## `features`

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `uploadFile` | `boolean` | `true` | Show upload-file action. |
| `uploadFolder` | `boolean` | `true` | Show upload-folder action. |
| `newFolder` | `boolean` | `true` | Show create-folder action. |
| `newFile` | `boolean` | `true` | Show create-text-file action. |
| `preview` | `boolean` | `true` | Show open / preview action. |
| `detail` | `boolean` | `true` | Show detail / edit action. |
| `download` | `boolean` | `true` | Show download action. |
| `move` | `boolean` | `true` | Show move action. |
| `copy` | `boolean` | `true` | Show copy action. |
| `rename` | `boolean` | `true` | Show rename action. |
| `delete` | `boolean` | `true` | Show delete action. |
| `tagFilter` | `boolean` | `true` | Show tag filter related UI. |

## Important Notes

- This component is a UI layer, not a storage SDK.
- Your app is responsible for loading data, creating folders, renaming files, deleting entries, and handling uploads.
- In transfer dialogs, `source.id` is usually the storage or location id.
- In `onCreate`, the `source` field is only present when the create action comes from the transfer dialog.
