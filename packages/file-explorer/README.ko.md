# @nextdj/file-explorer

앱에서 쉽게 연동할 수 있는 React 파일 탐색기 컴포넌트입니다.

다른 언어:

- [English](./README.md)
- [简体中文](./README.zh-CN.md)
- [日本語](./README.ja.md)

라이브 데모:

- [https://file-explorer-demo.vercel.app/](https://file-explorer-demo.vercel.app/)

![File Explorer Demo](https://raw.githubusercontent.com/i-dj/file-explorer/main/packages/file-explorer/assets/demo.png)

## 설치

```bash
pnpm add @nextdj/file-explorer
```

전역 CSS에 추가하세요:

```css
@import "tailwindcss";
@import "@nextdj/file-explorer/theme.css";
@source "../node_modules/@nextdj/file-explorer/dist/**/*.js";
```

## 가장 간단한 예시

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

## 일반적인 예시

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

## 자주 쓰는 설정

### 멀티 선택, 그리드 크기, 글자 크기, 테마

```tsx
<FileExplorer
  data={data}
  allowMultiSelect={false}
  gridSize="lg"
  fontSize="sm"
  theme="dark"
/>
```

지원 값:

- `"sm"`
- `"md"`
- `"lg"`

`fontSize` 도 다음 값을 지원합니다:

- `"sm"`
- `"md"`
- `"lg"`

`theme` 도 다음 값을 지원합니다:

- `"auto"`
- `"light"`
- `"dark"`

### 기본 뷰와 기본 정렬

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  defaultSortField="updatedAt"
  defaultSortDirection="desc"
/>
```

### 앱에서 뷰와 정렬 직접 제어

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

### 사용자 정의 리스트 컬럼

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

기본 내장 컬럼 전체를 직접 제어하고 싶다면 `getListColumns` 를 사용하세요.

예: `size` 컬럼을 숨기고 순서를 바꾸고, `Deleted time` 컬럼을 추가하기:

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

기본 액션 컬럼도 `defaultColumns` 안에 포함되어 있습니다. `key` 는 `__actions__` 이므로 삭제, 이동, 교체가 가능합니다.

예: 액션 컬럼을 완전히 제거하기:

```tsx
<FileExplorer
  data={data}
  defaultViewMode="list"
  getListColumns={(defaultColumns) =>
    defaultColumns.filter((col) => col.key !== "__actions__")
  }
/>
```

예: 액션 컬럼을 직접 만든 버튼으로 교체하기:

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

## 헤더 표시 제어

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

## 기본 Props

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `data` | `FileExplorerData` | 메인 데이터 입력값입니다. |
| `files` | `FileNode[]` | 구 버전 분리 입력입니다. |
| `breadcrumbs` | `BreadcrumbItem[]` | 구 버전 분리 입력입니다. |
| `storageInfo` | `{ totalBytes?: number; availableBytes?: number }` | 용량 정보를 표시합니다. |
| `fontSize` | `"sm" \| "md" \| "lg"` | 컴포넌트 전체 글자 크기입니다. 기본값은 `"md"` 입니다. |
| `theme` | `"auto" \| "light" \| "dark"` | 테마 모드입니다. 기본값은 `"auto"` 입니다. |
| `lang` | `string` | 언어를 설정합니다. |
| `dateFormat` | `string` | 날짜 형식을 설정합니다. |
| `renderPreview` | `(file) => ReactNode` | grid 미리보기를 커스터마이즈합니다. |
| `renderDetail` | `(file) => ReactNode` | 상세 패널 내용을 커스터마이즈합니다. |

## 뷰와 선택 Props

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `allowMultiSelect` | `boolean` | 다중 선택 허용 여부입니다. |
| `gridSize` | `"sm" \| "md" \| "lg"` | 그리드 카드 크기입니다. |
| `defaultViewMode` | `"grid" \| "list"` | 초기 뷰 모드입니다. |
| `viewMode` | `"grid" \| "list"` | 제어형 뷰 모드입니다. |
| `onViewModeChange` | `(mode) => void` | 뷰 변경 콜백입니다. |
| `defaultSortField` | `keyof FileNode \| string` | 초기 정렬 필드입니다. |
| `defaultSortDirection` | `"asc" \| "desc"` | 초기 정렬 방향입니다. |
| `sortField` | `keyof FileNode \| string` | 제어형 정렬 필드입니다. |
| `sortDirection` | `"asc" \| "desc"` | 제어형 정렬 방향입니다. |
| `onSortChange` | `(field, direction) => void` | 정렬 변경 콜백입니다. |
| `listColumns` | `FileListColumn[]` | 사용자 정의 리스트 컬럼을 추가합니다. |
| `getListColumns` | `(defaultColumns) => FileListColumn[]` | 기본 리스트 컬럼 전체를 직접 제어합니다. |

## 헤더와 기능 Props

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `showBreadcrumbs` | `boolean` | 브레드크럼 표시 여부입니다. |
| `showToolbar` | `boolean` | 가운데 툴바 표시 여부입니다. |
| `viewControls` | `FileExplorerViewControls` | 오른쪽 버튼과 표시 메뉴를 제어합니다. |
| `toolbarStyle` | `"default" \| "floating" \| "transparent"` | 헤더 스타일입니다. |
| `features` | `FileExplorerFeatures` | 내장 기능 사용 여부를 제어합니다. |
| `uploadOptions` | `FileExplorerUploadOptions` | Uppy 업로드 옵션입니다. |
| `onUploadStateChange` | `(snapshot) => void` | 업로드 상태 변경 콜백입니다. |

## 전송 대화상자 Props

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `dataSource` | `TransferDataSource[]` | 복사/이동 대화상자의 데이터 소스입니다. |
| `loadDataSourceFolder` | `(source, target) => Promise<FileExplorerData>` | 대화상자 안에서 폴더를 지연 로딩합니다. |

## 콜백 Props

| Prop | 타입 | 설명 |
| --- | --- | --- |
| `onOpen` | `(file) => void` | 파일 열기 시 호출됩니다. |
| `onOpenFolder` | `(folder) => void` | 폴더 열기 시 호출됩니다. |
| `onNavigateBreadcrumb` | `(item) => void` | 브레드크럼 클릭 시 호출됩니다. |
| `onTagColorsChange` | `(file, colors) => void` | 태그 색상 변경 시 호출됩니다. |
| `onCreate` | `(payload) => Promise<{ id; name; type; parentId? } \| void> \| { id; name; type; parentId? } \| void` | 생성 처리 콜백입니다. |
| `onRename` | `(payload) => void \| Promise<void>` | 이름 변경 콜백입니다. |
| `onDelete` | `(entries) => void \| Promise<void>` | 삭제 콜백입니다. |
| `onCopy` | `({ entries, destination }) => void \| Promise<void>` | 복사 확인 콜백입니다. |
| `onMove` | `({ entries, destination }) => void \| Promise<void>` | 이동 확인 콜백입니다. |
| `appendContextMenuItems` | `(file) => FileContextMenuItem[]` | 컨텍스트 메뉴 항목을 추가합니다. |
| `hideContextMenuActions` | `(file) => FileContextMenuActionId[]` | 기본 메뉴 항목을 숨깁니다. |
| `replaceContextMenuActions` | `(file) => Partial<Record<FileContextMenuActionId, FileContextMenuItem>>` | 기본 메뉴 항목을 교체합니다. |
| `getContextMenuItems` | `(file, defaultItems) => FileContextMenuItem[]` | 컨텍스트 메뉴 전체를 직접 제어합니다. |

## 참고

- 이 컴포넌트는 UI 레이어이며 스토리지 SDK가 아닙니다.
- 데이터 로드, 생성, 이름 변경, 삭제, 업로드 처리는 앱에서 직접 구현해야 합니다.
