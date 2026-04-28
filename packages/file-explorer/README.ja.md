# @nextdj/file-explorer

アプリ側で統合しやすい React ファイルエクスプローラーコンポーネントです。

他の言語:

- [English](./README.md)
- [简体中文](./README.zh-CN.md)
- [한국어](./README.ko.md)

ライブデモ:

- [https://file-explorer-demo.vercel.app/](https://file-explorer-demo.vercel.app/)

![File Explorer Demo](https://raw.githubusercontent.com/nextdj/file-explorer/main/packages/file-explorer/assets/demo.png)

## インストール

```bash
pnpm add @nextdj/file-explorer
```

グローバル CSS に追加します:

```css
@import "tailwindcss";
@import "@nextdj/file-explorer/theme.css";
@source "../node_modules/@nextdj/file-explorer/dist/**/*.js";
```

## 最小例

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

## 一般的な例

```tsx
import {
  FileExplorer,
  type FileExplorerData,
  type TransferDataSource,
} from "@nextdj/file-explorer";

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
      name: "specification.pdf",
      type: "file",
      size: 204800,
      extension: "pdf",
      updatedAt: new Date().toISOString(),
      mimeType: "application/pdf",
      mediaType: "file",
    },
  ],
};

const dataSource: TransferDataSource[] = [
  {
    id: "local",
    name: "Local Documents",
    list: [{ id: "local", name: "Local Documents" }],
  },
];

export default function Page() {
  return (
    <FileExplorer
      data={data}
      dataSource={dataSource}
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

## よく使う設定

### 複数選択、グリッドサイズ、文字サイズ、テーマ

```tsx
<FileExplorer
  data={data}
  allowMultiSelect={false}
  gridSize="lg"
  fontSize="sm"
  theme="dark"
/>
```

対応値:

- `"sm"`
- `"md"`
- `"lg"`

`fontSize` も次をサポートします:

- `"sm"`
- `"md"`
- `"lg"`

`theme` も次をサポートします:

- `"auto"`
- `"light"`
- `"dark"`

### 初期ビューと初期ソート

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  defaultSortField="updatedAt"
  defaultSortDirection="desc"
/>
```

### ビューとソートをアプリ側で制御

```tsx
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

### カスタムリスト列

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  listColumns={[
    {
      key: "deletedAt",
      label: "Deleted time",
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

組み込み列を丸ごと制御したい場合は `getListColumns` を使ってください。

例: `size` を非表示にして順序を並べ替え、さらに `Deleted time` を追加する:

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

組み込みのアクション列も `defaultColumns` に含まれています。`key` は `__actions__` なので、削除・移動・置き換えができます。

例: アクション列を完全に削除する:

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  getListColumns={(defaultColumns) =>
    defaultColumns.filter((col) => col.key !== "__actions__")
  }
/>
```

例: アクション列を独自ボタンに置き換える:

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

## ヘッダー表示制御

```tsx
<FileExplorer
  data={data}
  showBreadcrumbs={true}
  showToolbar={true}
  viewControls={{
    showDisplayButton: true,
    showViewToggleButton: true,
  }}
/>
```

## 基本 Props

| Prop | 型 | 説明 |
| --- | --- | --- |
| `data` | `FileExplorerData` | メイン入力データ。 |
| `files` | `FileNode[]` | 旧方式の分割入力。 |
| `breadcrumbs` | `BreadcrumbItem[]` | 旧方式の分割入力。 |
| `storageInfo` | `{ totalBytes?: number; availableBytes?: number }` | 容量情報を表示します。 |
| `fontSize` | `"sm" \| "md" \| "lg"` | コンポーネント全体の文字サイズ。既定値は `"md"`。 |
| `theme` | `"auto" \| "light" \| "dark"` | テーマモード。既定値は `"auto"`。 |
| `lang` | `string` | ロケールを設定します。 |
| `dateFormat` | `string` | 日時表示形式を設定します。 |
| `renderPreview` | `(file) => ReactNode` | grid プレビューをカスタマイズします。 |
| `renderDetail` | `(file) => ReactNode` | 詳細パネル内容をカスタマイズします。 |

## ビューと選択 Props

| Prop | 型 | 説明 |
| --- | --- | --- |
| `allowMultiSelect` | `boolean` | 複数選択を許可するか。 |
| `gridSize` | `"sm" \| "md" \| "lg"` | グリッドカードサイズ。 |
| `defaultViewMode` | `"grid" \| "list"` | 初期ビュー。 |
| `viewMode` | `"grid" \| "list"` | 制御されたビュー。 |
| `onViewModeChange` | `(mode) => void` | ビュー変更時のコールバック。 |
| `defaultSortField` | `keyof FileNode \| string` | 初期ソート列。 |
| `defaultSortDirection` | `"asc" \| "desc"` | 初期ソート方向。 |
| `sortField` | `keyof FileNode \| string` | 制御されたソート列。 |
| `sortDirection` | `"asc" \| "desc"` | 制御されたソート方向。 |
| `onSortChange` | `(field, direction) => void` | ソート変更時のコールバック。 |
| `listColumns` | `FileListColumn[]` | カスタムリスト列を追加します。 |
| `getListColumns` | `(defaultColumns) => FileListColumn[]` | 組み込みリスト列を完全に制御します。 |

## ヘッダーと機能 Props

| Prop | 型 | 説明 |
| --- | --- | --- |
| `showBreadcrumbs` | `boolean` | パンくずの表示制御。 |
| `showToolbar` | `boolean` | 中央ツールバーの表示制御。 |
| `viewControls` | `FileExplorerViewControls` | 右側ボタンと表示メニューの制御。 |
| `toolbarStyle` | `"default" \| "floating" \| "transparent"` | ヘッダースタイル。 |
| `features` | `FileExplorerFeatures` | 組み込み機能の有効/無効。 |
| `uploadOptions` | `FileExplorerUploadOptions` | Uppy アップロード設定。 |
| `onUploadStateChange` | `(snapshot) => void` | アップロード状態を監視します。 |

## 転送ダイアログ Props

| Prop | 型 | 説明 |
| --- | --- | --- |
| `dataSource` | `TransferDataSource[]` | コピー/移動ダイアログのデータソース。 |
| `loadDataSourceFolder` | `(source, target) => Promise<FileExplorerData>` | ダイアログ内のフォルダを遅延読み込みします。 |

## コールバック Props

| Prop | 型 | 説明 |
| --- | --- | --- |
| `onOpen` | `(file) => void` | ファイルを開く時に呼ばれます。 |
| `onOpenFolder` | `(folder) => void` | フォルダを開く時に呼ばれます。 |
| `onNavigateBreadcrumb` | `(item) => void` | パンくずクリック時に呼ばれます。 |
| `onTagColorsChange` | `(file, colors) => void` | タグ色変更時に呼ばれます。 |
| `onCreate` | `(payload) => Promise<{ id; name; type; parentId? } \| void> \| { id; name; type; parentId? } \| void` | 作成処理を担当します。 |
| `onRename` | `(payload) => void \| Promise<void>` | リネーム処理。 |
| `onDelete` | `(entries) => void \| Promise<void>` | 削除処理。 |
| `onCopy` | `({ entries, destination }) => void \| Promise<void>` | コピー確認時の処理。 |
| `onMove` | `({ entries, destination }) => void \| Promise<void>` | 移動確認時の処理。 |
| `appendContextMenuItems` | `(file) => FileContextMenuItem[]` | 右クリックメニューを追加。 |
| `hideContextMenuActions` | `(file) => FileContextMenuActionId[]` | 組み込み右クリック項目を非表示。 |
| `replaceContextMenuActions` | `(file) => Partial<Record<FileContextMenuActionId, FileContextMenuItem>>` | 組み込み右クリック項目を置換。 |
| `getContextMenuItems` | `(file, defaultItems) => FileContextMenuItem[]` | 右クリックメニューを完全に上書き。 |

## 注意

- このコンポーネントは UI レイヤーであり、ストレージ SDK ではありません。
- 読み込み、作成、リネーム、削除、アップロードの実処理はアプリ側で行います。
