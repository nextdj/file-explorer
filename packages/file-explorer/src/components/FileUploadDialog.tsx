import type { DragEvent } from "react";
import {
  Check,
  FileUp,
  FolderUp,
  Pause,
  Play,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFileUpload, useUppyUpload } from "../hooks";
import { cn, getFileConfig } from "../lib";
import { useFileExplorerContext } from "../context";
import { useUploadStore } from "../store/useUploadStore";
import type { FileUploadSnapshot } from "../types";
import { Button } from "./Button";

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadStateChange?: (snapshot: FileUploadSnapshot) => void;
}

interface FileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
}

interface FileSystemFileEntry extends FileSystemEntry {
  file: (callback: (file: File) => void) => void;
}

interface FileSystemDirectoryEntry extends FileSystemEntry {
  createReader: () => {
    readEntries: (callback: (entries: FileSystemEntry[]) => void) => void;
  };
}

type DataTransferItemWithEntry = DataTransferItem & {
  webkitGetAsEntry?: DataTransferItem["webkitGetAsEntry"];
};

const getAsEntry = (item: DataTransferItem): FileSystemEntry | null => {
  const itemWithEntry = item as DataTransferItemWithEntry;
  return itemWithEntry.webkitGetAsEntry?.() ?? null;
};

const MAX_VISIBLE_FILES = 10;

const formatSize = (size?: number) => {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = size;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
};

const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainSeconds}s`;
  }

  return `${remainSeconds}s`;
};

const readDirectoryEntries = async (
  directory: FileSystemDirectoryEntry,
): Promise<FileSystemEntry[]> => {
  const reader = directory.createReader();
  const entries: FileSystemEntry[] = [];

  while (true) {
    const batch = await new Promise<FileSystemEntry[]>((resolve) => {
      reader.readEntries(resolve);
    });

    if (batch.length === 0) break;
    entries.push(...batch);
  }

  return entries;
};

const readEntryFiles = async (entry: FileSystemEntry): Promise<File[]> => {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve) => {
      (entry as FileSystemFileEntry).file(resolve);
    });

    const relativePath = entry.fullPath.replace(/^\//, "");
    if (relativePath) {
      Object.defineProperty(file, "webkitRelativePath", {
        configurable: true,
        value: relativePath,
      });
    }

    return [file];
  }

  if (entry.isDirectory) {
    const entries = await readDirectoryEntries(
      entry as FileSystemDirectoryEntry,
    );
    const nestedFiles = await Promise.all(entries.map(readEntryFiles));
    return nestedFiles.flat();
  }

  return [];
};

export const FileUploadDialog = ({
  open,
  onClose,
  onUploadStateChange,
}: FileUploadDialogProps) => {
  const isExternallyManaged = Boolean(onUploadStateChange);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmittingToExternal, setIsSubmittingToExternal] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const dragDepthRef = useRef(0);
  const closeTimerRef = useRef<number | null>(null);
  const previousActiveCountRef = useRef(0);
  const { features, breadcrumbs, lang, t } = useFileExplorerContext();
  const { upload } = useFileUpload();
  const { addFiles, uppy } = useUppyUpload();
  const fileMap = useUploadStore((state) => state.files);
  const pauseFile = useUploadStore((state) => state.pauseFile);
  const retryFile = useUploadStore((state) => state.retryFile);
  const clearCompleted = useUploadStore((state) => state.clearCompleted);

  const sortedFiles = useMemo(() => {
    const statusWeight = {
      uploading: 0,
      paused: 1,
      queued: 2,
      error: 3,
      complete: 4,
      canceled: 5,
    } as const;

    return Object.values(fileMap).sort(
      (a, b) => statusWeight[a.status] - statusWeight[b.status],
    );
  }, [fileMap]);

  const hasFiles = sortedFiles.length > 0;
  const isScrollable = sortedFiles.length > MAX_VISIBLE_FILES;
  const totalBytes = useMemo(
    () => sortedFiles.reduce((sum, file) => sum + (file.size ?? 0), 0),
    [sortedFiles],
  );
  const uploadedBytes = useMemo(
    () =>
      sortedFiles.reduce(
        (sum, file) =>
          sum + ((file.size ?? 0) * Math.min(file.progress, 100)) / 100,
        0,
      ),
    [sortedFiles],
  );
  const totalProgress =
    totalBytes > 0
      ? Math.round((uploadedBytes / totalBytes) * 100)
      : hasFiles
        ? Math.round(
            sortedFiles.reduce((sum, file) => sum + file.progress, 0) /
              sortedFiles.length,
          )
        : 0;
  const activeCount = sortedFiles.filter(
    (file) =>
      file.status === "queued" ||
      file.status === "uploading" ||
      file.status === "paused",
  ).length;
  const completedCount = sortedFiles.filter(
    (file) => file.status === "complete",
  ).length;
  const errorCount = sortedFiles.filter(
    (file) => file.status === "error",
  ).length;
  const isSessionActive = activeCount > 0;
  const totalDurationSeconds =
    isSessionActive && sessionStartedAt !== null
      ? Math.max(0, Math.floor((now - sessionStartedAt) / 1000))
      : sessionElapsedSeconds;
  const totalDuration = formatDuration(totalDurationSeconds);
  const canUploadFiles = features.uploadFile;
  const canUploadFolders = features.uploadFolder;
  const canUploadAnything = canUploadFiles || canUploadFolders;
  const dragHint =
    canUploadFiles && canUploadFolders
      ? t("upload.hint.all")
      : canUploadFiles
        ? t("upload.hint.files")
        : canUploadFolders
          ? t("upload.hint.folders")
          : t("upload.hint.disabled");
  const uploadTargetMeta = useMemo(() => {
    const currentFolder = breadcrumbs?.[breadcrumbs.length - 1];
    return {
      targetFolderId: currentFolder?.id ?? "",
      targetFolderName: currentFolder?.name ?? "",
      targetPath:
        breadcrumbs && breadcrumbs.length > 0
          ? breadcrumbs.map((item) => item.name).join(" / ")
          : "/",
    };
  }, [breadcrumbs]);
  const buildAddFileOptions = () => ({
    missingEndpointMessage: t("upload.missingEndpoint"),
    getErrorMessage: (error: unknown, file: File) => {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "";

      if (message.includes("exceeds maximum allowed size")) {
        return t("upload.error.fileTooLarge", { name: file.name });
      }

      if (message.includes("you can only upload")) {
        return t("upload.error.invalidType", { name: file.name });
      }

      if (message.includes("Cannot add the duplicate file")) {
        return t("upload.error.duplicate", { name: file.name });
      }

      if (message) {
        return t("upload.error.validation", {
          name: file.name,
          message,
        });
      }

      return t("upload.error.validationUnknown", { name: file.name });
    },
  });

  const pushErrorMessage = (message: string) => {
    setErrorMessages((prev) => {
      if (prev.includes(message)) return prev;
      return [...prev, message].slice(-4);
    });
  };

  const resetErrorMessages = () => {
    setErrorMessages([]);
  };

  const closeExternallyManagedDialog = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    setIsSubmittingToExternal(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsSubmittingToExternal(false);
      closeTimerRef.current = null;
      onClose();
    }, 180);
  };

  useEffect(() => {
    if (open) {
      resetErrorMessages();
      setIsSubmittingToExternal(false);
    }
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const previousActiveCount = previousActiveCountRef.current;

    if (activeCount > 0 && previousActiveCount === 0) {
      const startedAt = Date.now();
      setSessionStartedAt(startedAt);
      setNow(startedAt);
      setSessionElapsedSeconds(0);
    }

    if (
      activeCount === 0 &&
      previousActiveCount > 0 &&
      sessionStartedAt !== null
    ) {
      const endedAt = Date.now();
      setNow(endedAt);
      setSessionElapsedSeconds(
        Math.max(0, Math.floor((endedAt - sessionStartedAt) / 1000)),
      );
      setSessionStartedAt(null);
    }

    if (!hasFiles && previousActiveCount === 0) {
      setSessionElapsedSeconds(0);
      setSessionStartedAt(null);
    }

    previousActiveCountRef.current = activeCount;
  }, [activeCount, hasFiles, sessionStartedAt]);

  useEffect(() => {
    if (!isSessionActive || sessionStartedAt === null) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSessionActive, sessionStartedAt]);

  useEffect(() => {
    onUploadStateChange?.({
      files: sortedFiles,
      summary: {
        totalProgress,
        totalBytes,
        uploadedBytes,
        totalDurationSeconds,
        fileCount: sortedFiles.length,
        activeCount,
        completedCount,
        errorCount,
      },
    });
  }, [
    activeCount,
    completedCount,
    errorCount,
    onUploadStateChange,
    sortedFiles,
    totalBytes,
    totalDurationSeconds,
    totalProgress,
    uploadedBytes,
  ]);

  useEffect(() => {
    const handleUploadError = (
      file?: { name?: string } | null,
      error?: Error,
    ) => {
      const message = error?.message
        ? t("upload.failedWithMessage", {
            name: file?.name ?? t("detail.file"),
            message: error.message,
          })
        : t("upload.failedWithoutMessage", {
            name: file?.name ?? t("detail.file"),
          });
      pushErrorMessage(message);
    };

    uppy.on("upload-error", handleUploadError);
    return () => {
      uppy.off("upload-error", handleUploadError);
    };
  }, [uppy]);

  const handleSelect = (mode: "file" | "folder") => {
    if (
      (mode === "file" && !canUploadFiles) ||
      (mode === "folder" && !canUploadFolders)
    ) {
      return;
    }

    resetErrorMessages();
    upload(mode, (selectedFiles) => {
      const addedCount = addFiles(
        selectedFiles,
        uploadTargetMeta,
        pushErrorMessage,
        buildAddFileOptions(),
      );
      if (isExternallyManaged && addedCount > 0) {
        closeExternallyManagedDialog();
      }
    });
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragActive(false);
    resetErrorMessages();

    const items = Array.from(event.dataTransfer.items ?? []);
    const entryItems = items
      .map(getAsEntry)
      .filter(Boolean) as FileSystemEntry[];

    if (!canUploadAnything) {
      return;
    }

    if (entryItems.length > 0) {
      const allowedEntries = entryItems.filter((entry) => {
        if (entry.isDirectory) return canUploadFolders;
        if (entry.isFile) return canUploadFiles;
        return false;
      });

      const droppedFiles = (
        await Promise.all(allowedEntries.map(readEntryFiles))
      ).flat();
      if (droppedFiles.length > 0) {
        const addedCount = addFiles(
          droppedFiles,
          uploadTargetMeta,
          pushErrorMessage,
          buildAddFileOptions(),
        );
        if (isExternallyManaged && addedCount > 0) {
          closeExternallyManagedDialog();
        }
        return;
      }
    }

    const fallbackFiles = canUploadFiles
      ? Array.from(event.dataTransfer.files ?? [])
      : [];
    if (fallbackFiles.length > 0) {
      const addedCount = addFiles(
        fallbackFiles,
        uploadTargetMeta,
        pushErrorMessage,
        buildAddFileOptions(),
      );
      if (isExternallyManaged && addedCount > 0) {
        closeExternallyManagedDialog();
      }
    }
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragActive(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center px-4 py-8">
      <div
        className={cn(
          "absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-180",
          isSubmittingToExternal && "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-(--_fe-border) bg-(--_fe-bg) shadow-2xl transition-all duration-180 ease-out",
          isSubmittingToExternal && "translate-y-2 scale-[0.985] opacity-0",
        )}
      >
        <div className="flex items-start justify-between   px-8 py-8">
          <div className="min-w-0">
            <h3 className="max-w-155 truncate text-[length:var(--_fe-font-xl)] leading-tight font-medium text-(--_fe-selected)">
              {t("upload.title")}
            </h3>
            <p className="mt-1 text-[length:var(--_fe-font-sm)] text-(--_fe-text-muted)">{dragHint}</p>
          </div>

          <Button
            icon={X}
            variant="ghost"
            tip={t("action.close")}
            onClick={onClose}
          />
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-hidden px-8 py-0 pb-12">
          <div
            className={cn(
              "flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-5 text-center transition-colors",
              isDragActive
                ? "border-(--_fe-primary-bg) bg-(--_fe-primary-bg)/8"
                : "border-(--_fe-border) bg-(--_fe-hover)/30",
            )}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--_fe-bg) text-(--_fe-primary-bg) shadow-sm">
              <Upload size={22} />
            </div>

            {canUploadAnything ? (
              <>
                <p className="mt-2 text-[length:var(--_fe-font-sm)] text-(--_fe-text-secondary)">
                  {t("upload.chooseFromButtons")}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {canUploadFiles ? (
                    <Button
                      icon={FileUp}
                      variant="primary"
                      className="min-w-32"
                      onClick={() => handleSelect("file")}
                    >
                      {t("action.selectFile")}
                    </Button>
                  ) : null}
                  {canUploadFolders ? (
                    <Button
                      icon={FolderUp}
                      variant={canUploadFiles ? "secondary" : "primary"}
                      className="min-w-32"
                      onClick={() => handleSelect("folder")}
                    >
                      {t("action.selectFolder")}
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="mt-3 text-[length:var(--_fe-font-sm)] text-(--_fe-text-muted)">
                {t("upload.disabledMessage")}
              </p>
            )}
          </div>

          {errorMessages.length > 0 ? (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3">
              <div className="flex items-start gap-3">
                <TriangleAlert
                  size={16}
                  className="mt-0.5 shrink-0 text-rose-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[length:var(--_fe-font-sm)] font-medium text-rose-600">
                    {t("upload.errorCount", { count: errorMessages.length })}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {errorMessages.map((message) => (
                      <div key={message} className="flex items-start gap-2">
                        <span className="mt-1.75 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                        <p className="min-w-0 text-[length:var(--_fe-font-sm)] leading-5 text-rose-600">
                          {message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {hasFiles && !isExternallyManaged ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="mb-3 rounded-xl bg-(--_fe-hover)/20 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[length:var(--_fe-font-sm)] font-medium text-(--_fe-selected)">
                      {t("upload.totalProgress", { value: totalProgress })}
                    </p>
                    <p className="mt-1 text-[length:var(--_fe-font-xs)] text-(--_fe-text-muted)">
                      {t("upload.uploaded", {
                        uploaded: formatSize(uploadedBytes),
                        total: formatSize(totalBytes),
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[length:var(--_fe-font-sm)] font-medium text-(--_fe-selected)">
                      {t("upload.totalTime", { value: totalDuration })}
                    </p>
                    <p className="mt-1 text-[length:var(--_fe-font-xs)] text-(--_fe-text-muted)">
                      {t("upload.taskCount", { count: sortedFiles.length })}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1 overflow-hidden bg-(--_fe-hover)">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${Math.max(totalProgress, 4)}%` }}
                  />
                </div>
              </div>

              <div
                className="min-h-0 flex-1 overflow-y-scroll"
                style={{ maxHeight: `${MAX_VISIBLE_FILES * 20}px` }}
              >
                <div className="space-y-2">
                  {sortedFiles.map((file) => {
                    const isPaused = file.status === "paused";
                    const isDone = file.status === "complete";
                    const isError = file.status === "error";
                    const showPause = !isDone && !isError;
                    const isWaiting = file.status === "queued";
                    const progressWidth =
                      isDone || isError
                        ? file.progress
                        : Math.max(
                            file.progress,
                            file.status === "uploading" || isWaiting ? 6 : 0,
                          );
                    const metaText = isDone
                      ? formatSize(file.size)
                      : isError
                        ? t("action.failed")
                        : isPaused
                          ? t("action.paused")
                          : isWaiting
                            ? t("action.waiting")
                            : `${file.progress}%`;
                    const { Icon, color, bgClass } = getFileConfig(
                      file.name,
                      lang,
                    );

                    return (
                      <div
                        key={file.id}
                        className={cn(
                          "relative overflow-hidden rounded-xl px-4 py-2 transition-colors",
                          isError ? "bg-rose-50/80" : "bg-(--_fe-hover)/35",
                        )}
                      >
                        {!isDone && !isError ? (
                          <div className="absolute inset-y-0 left-0 w-full">
                            <div
                              className={cn(
                                "h-full transition-all",
                                isPaused
                                  ? "bg-(--_fe-hover)"
                                  : "bg-(--_fe-hover)",
                              )}
                              style={{ width: `${progressWidth}%` }}
                            />
                          </div>
                        ) : null}

                        <div className="relative z-1 flex min-w-0 items-center gap-3">
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                              bgClass,
                            )}
                          >
                            <Icon size={13} className={color} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-4">
                              <p
                                className={cn(
                                  "truncate text-[length:var(--_fe-font-sm)] font-medium",
                                  isError
                                    ? "text-rose-500"
                                    : "text-(--_fe-selected)",
                                )}
                              >
                                {file.name}
                              </p>

                              <div className="flex shrink-0 items-center gap-4">
                                <div
                                  className={cn(
                                    "min-w-18 text-right text-[length:var(--_fe-font-sm)]",
                                    isError
                                      ? "font-medium text-rose-500"
                                      : "text-(--_fe-text-muted)",
                                  )}
                                >
                                  {metaText}
                                </div>

                                {isError ? (
                                  <button
                                    type="button"
                                    className="cursor-pointer text-[length:var(--_fe-font-sm)] font-medium text-rose-400 transition-colors hover:text-rose-500"
                                    onClick={() => retryFile(file.id)}
                                  >
                                    {t("action.retry")}
                                  </button>
                                ) : showPause ? (
                                  <button
                                    type="button"
                                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/85"
                                    onClick={() => pauseFile(file.id)}
                                  >
                                    {isPaused ? (
                                      <Play size={13} />
                                    ) : (
                                      <Pause size={13} />
                                    )}
                                  </button>
                                ) : isDone ? (
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                                    <Check size={13} />
                                  </span>
                                ) : (
                                  <span className="w-4" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden   flex-1 items-center justify-center px-6 py-10 text-[length:var(--_fe-font-sm)] text-(--_fe-text-secondary)"></div>
          )}
        </div>
      </div>
    </div>
  );
};
