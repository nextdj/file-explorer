# my-workspace

This repository is a small pnpm monorepo for the `@nextdj/file-explorer` package and its demo app.

It includes:

- the reusable React component package
- a Next.js demo app that shows how to integrate it
- local mock data so the demo can run without a backend

## Repository Structure

```text
my-workspace/
├── apps/
│   └── web/                 # Next.js demo app
├── packages/
│   └── file-explorer/       # Published component package
├── package.json             # Root workspace scripts
├── pnpm-workspace.yaml      # pnpm workspace definition
└── pnpm-lock.yaml
```

## Where The Source Code Lives

### Component package source

The published package source code is here:

- [packages/file-explorer/src](/Users/lyle/Documents/code/my-workspace/packages/file-explorer/src)

Main entry:

- [packages/file-explorer/src/index.ts](/Users/lyle/Documents/code/my-workspace/packages/file-explorer/src/index.ts)

Main component:

- [packages/file-explorer/src/FileExplorer.tsx](/Users/lyle/Documents/code/my-workspace/packages/file-explorer/src/FileExplorer.tsx)

Package README:

- [packages/file-explorer/README.md](/Users/lyle/Documents/code/my-workspace/packages/file-explorer/README.md)

### Demo app source

The demo app is here:

- [apps/web](/Users/lyle/Documents/code/my-workspace/apps/web)

Main page:

- [apps/web/app/page.tsx](/Users/lyle/Documents/code/my-workspace/apps/web/app/page.tsx)

Demo integration:

- [apps/web/app/FileList.tsx](/Users/lyle/Documents/code/my-workspace/apps/web/app/FileList.tsx)

Mock local data and CRUD:

- [apps/web/app/file-service.ts](/Users/lyle/Documents/code/my-workspace/apps/web/app/file-service.ts)
- [apps/web/app/mock-file-data.ts](/Users/lyle/Documents/code/my-workspace/apps/web/app/mock-file-data.ts)

## Where The Examples Are

There are two kinds of examples in this repo.

### 1. Package usage examples

These are documented in:

- [packages/file-explorer/README.md](/Users/lyle/Documents/code/my-workspace/packages/file-explorer/README.md)

That README includes examples for:

- basic usage
- CRUD callbacks
- uploads
- custom detail panels
- custom preview rendering
- context menu customization
- multi-source transfer flows

### 2. Real running example

The live working example is the demo app in:

- [apps/web/app/FileList.tsx](/Users/lyle/Documents/code/my-workspace/apps/web/app/FileList.tsx)

That file shows a real app-side integration of:

- route-based folder navigation
- local mock CRUD
- upload state handling
- custom detail rendering
- tag color persistence

## How To Install

This repo uses:

- `pnpm`
- `React`
- `Next.js`

Install dependencies from the repository root:

```bash
pnpm install
```

## How To Start The Project

From the repository root:

```bash
pnpm dev
```

This runs both:

- the `@nextdj/file-explorer` package in watch mode
- the `web` demo app in Next.js development mode

After that, open the local Next.js app in your browser. In a normal setup that is usually:

- [http://localhost:3000](http://localhost:3000)

## How Development Works

The package is developed from source, but consumed through `dist`.

That means:

- you edit files in [packages/file-explorer/src](/Users/lyle/Documents/code/my-workspace/packages/file-explorer/src)
- the package watch script rebuilds to `dist`
- the demo app picks up the updated package output

This keeps local development close to the real published package behavior.

## Useful Commands

### Root

Run the package watcher and demo app together:

```bash
pnpm dev
```

### Component package

Build the package:

```bash
pnpm --filter @nextdj/file-explorer build
```

Typecheck the package:

```bash
pnpm --filter @nextdj/file-explorer typecheck
```

### Demo app

Run only the demo app:

```bash
pnpm --filter web dev
```

Build the demo app:

```bash
pnpm --filter web build
```

## How The Demo Works

The demo app does not require a backend.

It uses local mock data and localStorage-backed CRUD:

- initial seeded data comes from [apps/web/app/mock-file-data.ts](/Users/lyle/Documents/code/my-workspace/apps/web/app/mock-file-data.ts)
- runtime CRUD behavior is handled in [apps/web/app/file-service.ts](/Users/lyle/Documents/code/my-workspace/apps/web/app/file-service.ts)

This makes it easier for someone cloning the repo to understand the integration without setting up a Go server or any external API.

## Upload Behavior In The Demo

The package supports uploads through Uppy + Tus.

In the demo app:

- the component upload picker is used to select files
- upload state is sent to the app through `onUploadStateChange`
- the app shows its own upload panel in:
  [apps/web/app/UploadDialog.tsx](/Users/lyle/Documents/code/my-workspace/apps/web/app/UploadDialog.tsx)

If you want to see the integration point, start here:

- [apps/web/app/FileList.tsx](/Users/lyle/Documents/code/my-workspace/apps/web/app/FileList.tsx)

## Package Name

The published package name is:

```bash
@nextdj/file-explorer
```

Package metadata:

- [packages/file-explorer/package.json](/Users/lyle/Documents/code/my-workspace/packages/file-explorer/package.json)

## How To Publish The Package

The package is published from:

- [packages/file-explorer](/Users/lyle/Documents/code/my-workspace/packages/file-explorer)

Typical flow:

```bash
cd packages/file-explorer
pnpm typecheck
pnpm build
npm publish --access public
```

There is a more detailed publish checklist in:

- [packages/file-explorer/README.md](/Users/lyle/Documents/code/my-workspace/packages/file-explorer/README.md)

## Notes

- `node_modules`, `.next`, `dist`, and local cache files are ignored by Git through:
  [/.gitignore](/Users/lyle/Documents/code/my-workspace/.gitignore)
- the workspace root is intended to be committed as the GitHub repository root
- the package can be published independently, but this repo is structured to keep the component and demo app together
