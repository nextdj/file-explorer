# @nextdj/file-explorer

A React file explorer component with:

- grid and list views
- breadcrumb navigation
- context menu actions
- file and folder uploads
- transfer dialogs for copy and move
- detail panel support
- customizable app-side handlers and rendering hooks

It is designed for app teams that want a polished file browser UI, while still keeping data loading, CRUD, uploads, and business rules in the host app.

Live demo:

- [https://file-explorer-demo.vercel.app/](https://file-explorer-demo.vercel.app/)

![File Explorer Demo](https://raw.githubusercontent.com/nextdj/file-explorer/main/packages/file-explorer/assets/demo.png)

## Install

```bash
npm install @nextdj/file-explorer
```

Peer dependencies:

```bash
npm install react react-dom
```

## Quick Start

```tsx
import { FileExplorer, type FileExplorerData } from "@nextdj/file-explorer";

const data: FileExplorerData = {
  breadcrumbs: [{ id: "root", name: "Files" }],
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
        console.log("navigate breadcrumb", item);
      }}
    />
  );
}
```

## Core Idea

`FileExplorer` is a UI component, not a storage system.

Your app is expected to provide:

- the current file list
- the current breadcrumb path
- storage capacity info if needed
- handlers for create, rename, delete, copy, move, and uploads

That means the component stays flexible enough to work with:

- REST APIs
- GraphQL backends
- local mock data
- cloud storage adapters
- custom business workflows

## Basic Data Model

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

The component reads a `FileExplorerData` object:

```ts
type FileExplorerData = {
  breadcrumbs: { id: string; name: string }[];
  files: FileNode[];
};
```

## Main Props

### `data`

The easiest way to drive the component.

```tsx
<FileExplorer data={{ breadcrumbs, files }} />
```

### `features`

Use `features` to show or hide built-in actions.

```tsx
<FileExplorer
  data={data}
  features={{
    uploadFile: true,
    uploadFolder: true,
    newFolder: true,
    newFile: false,
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

If a feature is `false`, the component hides it from both the toolbar and the context menu.

### `lang`

Supported locales:

- `en`
- `zh-CN`
- `zh-TW`
- `ja`
- `ko`
- `fr`
- `de`
- `es`
- `pt-BR`
- `ru`

If `lang` is omitted, the component falls back to browser language detection.

```tsx
<FileExplorer data={data} lang="en" />
```

### `toolbarStyle`

Controls the top bar style.

Available values:

- `default`
- `floating`
- `transparent`

```tsx
<FileExplorer data={data} toolbarStyle="default" />
```

## CRUD Callbacks

### `onCreate`

Called when the user confirms creation of a new file or folder.

```tsx
<FileExplorer
  data={data}
  onCreate={async ({ name, type, parentId, source }) => {
    if (type !== "folder") return;

    const created = await api.createFolder({ name, parentId, sourceId: source?.id });

    return {
      id: created.id,
      name: created.name,
      type: "folder",
      parentId: created.parentId,
    };
  }}
/>
```

### `onRename`

```tsx
<FileExplorer
  data={data}
  onRename={async ({ id, name }) => {
    await api.renameEntry({ id, name });
  }}
/>
```

### `onDelete`

Delete confirmation is best handled in the host app.

```tsx
<FileExplorer
  data={data}
  onDelete={async (entries) => {
    const confirmed = window.confirm(`Delete ${entries.length} item(s)?`);
    if (!confirmed) return;

    await api.deleteEntries(entries.map((entry) => entry.id));
  }}
/>
```

### `onCopy`

```tsx
<FileExplorer
  data={data}
  onCopy={async ({ entries, destination }) => {
    await api.copyEntries({
      entryIds: entries.map((entry) => entry.id),
      destinationId: destination.id,
      destinationFolderId: destination.folderId,
    });
  }}
/>
```

### `onMove`

```tsx
<FileExplorer
  data={data}
  onMove={async ({ entries, destination }) => {
    await api.moveEntries({
      entryIds: entries.map((entry) => entry.id),
      destinationId: destination.id,
      destinationFolderId: destination.folderId,
    });
  }}
/>
```

### `onTagColorsChange`

Use this to persist the selected tag colors in your app storage.

```tsx
<FileExplorer
  data={data}
  onTagColorsChange={async (file, colors) => {
    await api.updateTagColors({
      id: file.id,
      colors,
    });
  }}
/>
```

## Navigation Callbacks

### `onOpen`

Called when a file is opened.

### `onOpenFolder`

Called when a folder is opened.

### `onNavigateBreadcrumb`

Called when a breadcrumb item is selected.

These three are typically where your app updates route state or requests new data.

```tsx
<FileExplorer
  data={data}
  onOpen={(file) => window.open(`/files/${file.id}`, "_blank")}
  onOpenFolder={(folder) => router.push(`/?parentId=${folder.id}`)}
  onNavigateBreadcrumb={(item) => router.push(item.id === "root" ? "/" : `/?parentId=${item.id}`)}
/>
```

## Uploads

The component uses Uppy with Tus upload support.

### `uploadOptions`

```tsx
<FileExplorer
  data={data}
  uploadOptions={{
    endpoint: "https://your-tus-server.example/files/",
    headers: {
      Authorization: "Bearer token",
    },
    metadata: {
      bucket: "assets",
    },
    chunkSize: 5 * 1024 * 1024,
    retryDelays: [0, 1000, 3000],
    maxNumberOfFiles: 100,
    maxFileSize: 1024 * 1024 * 1024,
    allowedFileTypes: [".png", ".jpg", ".pdf"],
  }}
/>
```

Available upload options:

- `endpoint`
- `headers`
- `metadata`
- `withCredentials`
- `autoProceed`
- `chunkSize`
- `retryDelays`
- `maxNumberOfFiles`
- `maxFileSize`
- `allowedFileTypes`

### `onUploadStateChange`

If you pass `onUploadStateChange`, the component will emit the upload queue snapshot to the host app.

```tsx
<FileExplorer
  data={data}
  uploadOptions={{ endpoint: "https://your-tus-server.example/files/" }}
  onUploadStateChange={(snapshot) => {
    console.log(snapshot.files);
    console.log(snapshot.summary);
  }}
/>
```

The snapshot shape:

```ts
type FileUploadSnapshot = {
  files: FileUploadItem[];
  summary: {
    totalProgress: number;
    totalBytes: number;
    uploadedBytes: number;
    totalDurationSeconds: number;
    fileCount: number;
    activeCount: number;
    completedCount: number;
    errorCount: number;
  };
};
```

Important behavior:

- if `onUploadStateChange` is not provided, the component manages and displays its own upload progress UI
- if `onUploadStateChange` is provided, the host app is treated as the upload status owner
- in that mode, the component upload dialog acts as a file picker / uploader launcher, then closes after files are queued

## App-Side Upload Panel Example

```tsx
const [uploadSnapshot, setUploadSnapshot] = useState<FileUploadSnapshot | null>(null);

<FileExplorer
  data={data}
  uploadOptions={{ endpoint: "https://your-tus-server.example/files/" }}
  onUploadStateChange={setUploadSnapshot}
/>
```

Then render your own upload panel anywhere in the app:

```tsx
{uploadSnapshot ? <MyUploadPanel snapshot={uploadSnapshot} /> : null}
```

## Real App Integration Example

The most common integration pattern is:

1. your app owns route state
2. your app fetches the current folder data
3. `FileExplorer` renders that data
4. callbacks write changes back to your backend
5. your app refreshes the current folder after mutations

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileExplorer,
  type FileExplorerData,
  type FileNode,
} from "@nextdj/file-explorer";

const EMPTY_DATA: FileExplorerData = {
  breadcrumbs: [{ id: "root", name: "Files" }],
  files: [],
};

export function FilesPage() {
  const [data, setData] = useState<FileExplorerData>(EMPTY_DATA);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();

  const refreshFolder = useCallback(async (folderId?: string) => {
    const result = await api.getFilesByPath({ parentId: folderId });
    setData(result);
  }, []);

  useEffect(() => {
    void refreshFolder(currentFolderId);
  }, [currentFolderId, refreshFolder]);

  return (
    <FileExplorer
      data={data}
      storageInfo={{
        totalBytes: 512 * 1024 * 1024 * 1024,
        availableBytes: 420 * 1024 * 1024 * 1024,
      }}
      uploadOptions={{
        endpoint: "https://your-tus-server.example/files/",
        maxNumberOfFiles: 100,
        maxFileSize: 1024 * 1024 * 1024,
      }}
      onOpen={(file) => {
        window.open(`/files/${file.id}`, "_blank");
      }}
      onOpenFolder={(folder) => {
        setCurrentFolderId(folder.id);
      }}
      onNavigateBreadcrumb={(item) => {
        const isRoot = item.id === data.breadcrumbs[0]?.id;
        setCurrentFolderId(isRoot ? undefined : item.id);
      }}
      onCreate={async ({ name, type, parentId }) => {
        if (type !== "folder") return;

        const created = await api.createFolder({ name, parentId });
        await refreshFolder(currentFolderId);

        return {
          id: created.id,
          name: created.name,
          type: "folder",
          parentId: created.parentId,
        };
      }}
      onRename={async ({ id, name }) => {
        await api.renameEntry({ id, name });
        await refreshFolder(currentFolderId);
      }}
      onDelete={async (entries) => {
        const confirmed = window.confirm(`Delete ${entries.length} item(s)?`);
        if (!confirmed) return;

        await api.deleteEntries(entries.map((entry) => entry.id));
        await refreshFolder(currentFolderId);
      }}
      onMove={async ({ entries, destination }) => {
        await api.moveEntries({
          entryIds: entries.map((entry) => entry.id),
          destinationId: destination.id,
          destinationFolderId: destination.folderId,
        });
        await refreshFolder(currentFolderId);
      }}
      onCopy={async ({ entries, destination }) => {
        await api.copyEntries({
          entryIds: entries.map((entry) => entry.id),
          destinationId: destination.id,
          destinationFolderId: destination.folderId,
        });
        await refreshFolder(currentFolderId);
      }}
      onTagColorsChange={async (file, colors) => {
        await api.updateTagColors({ id: file.id, colors });

        setData((prev) => ({
          ...prev,
          files: prev.files.map((item) =>
            item.id === file.id ? { ...item, tagColors: colors } : item,
          ),
        }));
      }}
      renderDetail={(file) => (
        <div>
          <h3>{file.name}</h3>
          <p>ID: {file.id}</p>
          <p>Type: {file.type}</p>
        </div>
      )}
    />
  );
}
```

That pattern keeps all persistence in the app and lets the component stay reusable.

## Custom Preview and Detail

### `renderPreview`

Useful for image, video, or audio previews.

```tsx
<FileExplorer
  data={data}
  renderPreview={(file) => {
    if (file.mediaType === "image") {
      return <img src={`/preview/${file.id}`} alt={file.name} className="h-full w-full object-cover" />;
    }

    return null;
  }}
/>
```

### `renderDetail`

Render custom app-side details in the built-in detail panel.

```tsx
<FileExplorer
  data={data}
  renderDetail={(file) => (
    <div>
      <h3>{file.name}</h3>
      <p>ID: {file.id}</p>
      <p>Type: {file.type}</p>
      <p>Updated: {file.updatedAt}</p>
    </div>
  )}
/>
```

## Storage Capacity Header

If you want the header to show storage totals, pass `storageInfo`.

```tsx
<FileExplorer
  data={data}
  storageInfo={{
    totalBytes: 512 * 1024 * 1024 * 1024,
    availableBytes: 420 * 1024 * 1024 * 1024,
  }}
/>
```

## Multi-Source Transfer Support

For copy and move dialogs across multiple sources, provide:

- `dataSource`
- `transferTargets`
- `loadDataSourceFolder`

Example:

```tsx
<FileExplorer
  data={data}
  dataSource={[
    {
      id: "design",
      name: "Design Drive",
      list: [{ id: "design", name: "Design Drive" }],
    },
    {
      id: "marketing",
      name: "Marketing Vault",
      list: [{ id: "marketing", name: "Marketing Vault" }],
    },
  ]}
  loadDataSourceFolder={async (source, target) => {
    return api.getFilesByPath(source.id, {
      parentId: target.folderId ?? target.id,
    });
  }}
/>
```

## Context Menu Customization

### Append items

```tsx
<FileExplorer
  data={data}
  appendContextMenuItems={(file) => [
    {
      label: "Open in external system",
      action: "external-open",
      onSelect: () => {
        window.open(`/external/${file.id}`, "_blank");
      },
    },
  ]}
/>
```

### Hide built-in items

```tsx
<FileExplorer
  data={data}
  hideContextMenuActions={() => ["delete", "move"]}
/>
```

### Replace built-in items

```tsx
<FileExplorer
  data={data}
  replaceContextMenuActions={() => ({
    delete: {
      label: "Archive",
      action: "delete",
    },
  })}
/>
```

### Full override

```tsx
<FileExplorer
  data={data}
  getContextMenuItems={(file, defaultItems) => {
    return [
      ...defaultItems,
      {
        label: "Inspect metadata",
        action: "inspect",
        onSelect: () => console.log(file.metadata),
      },
    ];
  }}
/>
```

## Styling Notes

The component includes its own theme CSS and imports it internally.

If your tooling needs a direct CSS entry, this package also exports:

```ts
import "@nextdj/file-explorer/theme.css";
```

In most setups, importing `FileExplorer` is enough and you do not need to import the CSS separately.

## Suggested README Images

If you want the npm page to feel more polished, these are the highest-value visuals to add:

1. a full explorer screenshot
   show the header, breadcrumb, grid/list switch, and a mixed file list
2. an upload flow screenshot or gif
   show the upload dialog plus the app-side upload progress panel
3. a detail panel screenshot
   show how `renderDetail` extends the built-in detail drawer
4. a context menu screenshot
   show built-in actions plus one custom app action

Best placement:

- first screenshot right below the package title and short description
- upload screenshot in the `Uploads` section
- detail screenshot in the `Custom Preview and Detail` section
- context menu screenshot in the `Context Menu Customization` section

If you later want animated demos, short gifs usually work best for:

- switching between grid and list views
- drag-and-drop upload
- opening the detail panel

## Development

Inside this monorepo:

```bash
pnpm dev
```

That runs:

- `@nextdj/file-explorer` in watch mode and outputs to `dist`
- `web` in development mode

Useful package-level commands:

```bash
pnpm --filter @nextdj/file-explorer build
pnpm --filter @nextdj/file-explorer typecheck
```

## Publish

The package publishes from `dist`.

Before publishing:

```bash
pnpm --filter @nextdj/file-explorer build
```

Then publish from the package directory:

```bash
npm publish --access public
```

Because the package name is scoped, the published package will be:

```bash
@nextdj/file-explorer
```

## Publish Checklist

Use this checklist before publishing a new version:

1. update the version in `package.json`
2. run `pnpm --filter @nextdj/file-explorer typecheck`
3. run `pnpm --filter @nextdj/file-explorer build`
4. run `pnpm --filter web build`
5. review the generated `dist` output
6. review `README.md`
7. confirm the package name is correct: `@nextdj/file-explorer`
8. confirm the publish access is public
9. if needed, log in with `npm login`
10. publish with `npm publish`

Recommended quick verification:

```bash
cd packages/file-explorer
npm pack
```

That lets you inspect the exact files that would be published before pushing the package to npm.

## License

This repository does not currently include a `LICENSE` file.

If you plan to publish publicly, it is a good idea to add one before release so consumers know how they are allowed to use the package.

## Exported Types

The package exports:

- `CategoryColor`
- `FileNode`
- `FileExplorerLocale`
- `FileExplorerProps`
- `BreadcrumbItem`
- `FileExplorerData`
- `FileUploadItem`
- `FileUploadSnapshot`
- `FileUploadStatus`
- `FileUploadSummary`
- `FileExplorerUploadOptions`

## Notes

- `react` and `react-dom` are peer dependencies
- uploads require a valid Tus endpoint
- the component does not persist data by itself; your app owns the data source
- for production use, treat callbacks like `onCreate`, `onRename`, `onDelete`, `onCopy`, `onMove`, and `onTagColorsChange` as the persistence boundary
