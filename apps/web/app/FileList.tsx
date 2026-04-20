"use client";

import { FileExplorer } from "@nextdj/file-explorer";
import type {
  FileExplorerLocale,
  FileNode,
  FileUploadSnapshot,
} from "@nextdj/file-explorer";
import {
  Clapperboard,
  FilePenLine,
  HardDrive,
  Image as ImageIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppFileDetail } from "./AppFileDetail";
import { DemoPreview } from "./DemoPreview";
import { UploadDialog } from "./UploadDialog";
import {
  addUploadedEntriesApi,
  copyEntriesApi,
  createFolderApi,
  deleteEntriesApi,
  type FileResponseData,
  getFilesByPath,
  getStorages,
  getStorageInfo,
  moveEntriesApi,
  renameEntryApi,
  type StorageResponseData,
  updateTagColorsApi,
} from "./file-service";
import { formatBytes } from "./lib/format-bytes";

const STORAGE_ID = "1";

export function FileList({
  initialData,
  initialStorages,
  lang,
}: {
  initialData: FileResponseData | null;
  initialStorages: StorageResponseData;
  lang: FileExplorerLocale;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentParentId = searchParams.get("parentId") ?? undefined;
  const [data, setData] = useState<FileResponseData | null>(initialData);
  const [storages, setStorages] =
    useState<StorageResponseData>(initialStorages);
  const [uploadSnapshot, setUploadSnapshot] =
    useState<FileUploadSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(initialData === null);
  const importedUploadIdsRef = useRef<Set<string>>(new Set());

  const breadcrumbs = data?.breadcrumbs ?? [];

  const uploadOptions = useMemo(
    () => ({
      endpoint: "https://tusd.tusdemo.net/files/",
      chunkSize: 5 * 1024 * 1024,
      retryDelays: [0, 1000, 3000, 5000],
      maxNumberOfFiles: 100,
      maxFileSize: 1024 * 1024 * 1024,
    }),
    [],
  );

  const storageInfo = useMemo(() => getStorageInfo(STORAGE_ID), [data]);

  const refreshCurrentFolder = useCallback(async () => {
    setIsLoading(true);
    const next = await getFilesByPath(STORAGE_ID, {
      parentId: currentParentId,
    });
    setData(next);
    setIsLoading(false);
  }, [currentParentId]);

  useEffect(() => {
    void refreshCurrentFolder();
  }, [refreshCurrentFolder]);

  useEffect(() => {
    void getStorages().then(setStorages);
  }, []);

  const handleUploadStateChange = useCallback(
    async (snapshot: FileUploadSnapshot) => {
      setUploadSnapshot(snapshot);

      const completedFiles = snapshot.files.filter(
        (file) =>
          file.status === "complete" &&
          !importedUploadIdsRef.current.has(file.id),
      );

      if (completedFiles.length === 0) return;

      completedFiles.forEach((file) => {
        importedUploadIdsRef.current.add(file.id);
      });

      await addUploadedEntriesApi(
        completedFiles.map((file) => ({
          name: file.name,
          size: file.size,
          relativePath: file.relativePath,
          targetFolderId: file.targetFolderId,
        })),
      );

      const uploadedIntoCurrentFolder = completedFiles.some((file) => {
        if (!currentParentId) {
          return file.targetFolderId === STORAGE_ID || !file.targetFolderId;
        }

        return file.targetFolderId === currentParentId;
      });

      if (uploadedIntoCurrentFolder) {
        await refreshCurrentFolder();
      }
    },
    [currentParentId, refreshCurrentFolder],
  );

  const dataSource = useMemo(
    () =>
      storages.map((storage, index) => {
        const tabIcon =
          index === 0 ? (
            <ImageIcon size={14} />
          ) : index === 1 ? (
            <Clapperboard size={14} />
          ) : (
            <HardDrive size={14} />
          );

        return {
          id: storage.id,
          name: storage.name,
          icon: tabIcon,
          list: [
            {
              id: storage.id,
              name: storage.name,
              icon: tabIcon,
            },
          ],
        };
      }),
    [storages],
  );

  const navigateToFolder = (folderId?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (folderId) {
      params.set("parentId", folderId);
    } else {
      params.delete("parentId");
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  const openFolder = (folder: FileNode) => {
    navigateToFolder(folder.id);
  };

  const navigateBreadcrumb = (item: (typeof breadcrumbs)[number]) => {
    const isRoot = item.id === breadcrumbs[0]?.id;
    navigateToFolder(isRoot ? undefined : item.id);
  };

  const openMockFile = (file: FileNode) => {
    const previewWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!previewWindow) return;

    previewWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${file.name}</title>
          <style>
            body { margin: 40px; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #0f172a; background: #f8fafc; }
            h1 { margin-bottom: 12px; }
            pre { padding: 16px; border-radius: 16px; background: white; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.7; }
          </style>
        </head>
        <body>
          <h1>${file.name}</h1>
          <pre>Preview

Name: ${file.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
Type: ${file.type}
Size: ${formatBytes(file.size)}</pre>
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-500">Loading files...</div>
      </div>
    );
  }

  return (
    <div>
      <FileExplorer
        lang={lang}
        toolbarStyle="default"
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
        }}
        uploadOptions={uploadOptions}
        onUploadStateChange={handleUploadStateChange}
        data={data}
        dataSource={dataSource}
        loadDataSourceFolder={(source, target) => {
          const isStorageRoot = target.id === source.id;
          return getFilesByPath(source.id, {
            parentId: isStorageRoot
              ? undefined
              : (target.folderId ?? target.id),
          });
        }}
        onCreate={async ({ source, name, type, parentId }) => {
          if (type !== "folder") return;
          const storageId = source?.id ?? STORAGE_ID;
          const normalizedParentId =
            parentId === undefined || parentId === storageId
              ? undefined
              : parentId;

          const created = await createFolderApi({
            storageId,
            parentId: normalizedParentId,
            name,
          });

          return {
            id: created.id,
            name: created.name,
            type: "folder" as const,
            parentId: created.parentId,
          };
        }}
        onCopy={async ({ entries, destination }) => {
          await copyEntriesApi({
            entryIds: entries.map((entry) => entry.id),
            destinationId: destination.id,
            destinationFolderId: destination.folderId,
          });
          await refreshCurrentFolder();
        }}
        onMove={async ({ entries, destination }) => {
          await moveEntriesApi({
            entryIds: entries.map((entry) => entry.id),
            destinationId: destination.id,
            destinationFolderId: destination.folderId,
          });
          await refreshCurrentFolder();
        }}
        storageInfo={storageInfo}
        dateFormat="MM-DD-YYYY HH:mm:ss"
        renderPreview={(file) => {
          if (
            file.mediaType === "image" ||
            file.mediaType === "video" ||
            file.mediaType === "audio"
          ) {
            return <DemoPreview file={file} />;
          }

          return null;
        }}
        renderDetail={(file) => <AppFileDetail file={file} />}
        onOpen={openMockFile}
        onOpenFolder={openFolder}
        onNavigateBreadcrumb={navigateBreadcrumb}
        onRename={async ({ id, name }) => {
          await renameEntryApi({ id, name });
        }}
        onTagColorsChange={async (file, colors) => {
          await updateTagColorsApi({
            id: file.id,
            colors,
          });

          setData((prev) =>
            prev
              ? {
                  ...prev,
                  files: prev.files.map((item) =>
                    item.id === file.id
                      ? {
                          ...item,
                          tagColors: colors,
                        }
                      : item,
                  ),
                }
              : prev,
          );
        }}
        onDelete={async (entries) => {
          const confirmed = window.confirm(
            `Move ${entries.length} item(s) to trash?`,
          );
          if (!confirmed) return;

          await deleteEntriesApi({ ids: entries.map((entry) => entry.id) });
        }}
        appendContextMenuItems={() => [
          {
            label: "App custom detail payload",
            action: "app-edit",
            icon: FilePenLine,
            onSelect: (target) => {
              console.log("app custom detail payload", {
                file: target,
              });
            },
          },
        ]}
      />
      <UploadDialog snapshot={uploadSnapshot} />
    </div>
  );
}
