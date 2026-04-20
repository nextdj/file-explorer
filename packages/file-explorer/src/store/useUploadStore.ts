import { create } from "zustand";
import { uppy } from "../lib";

interface UploadFile {
  id: string;
  name: string;
  relativePath?: string;
  targetFolderId?: string;
  targetFolderName?: string;
  targetPath?: string;
  progress: number;
  size?: number;
  status: "queued" | "uploading" | "paused" | "complete" | "error" | "canceled";
}

interface UploadState {
  files: Record<string, UploadFile>;
  isUploading: boolean;
  pauseFile: (id: string) => void;
  retryFile: (id: string) => void;
  cancelFile: (id: string) => void;
  removeFile: (id: string) => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadState>((set) => {
  uppy.on("file-added", (file) => {
    set((state) => ({
      isUploading: true,
      files: {
        ...state.files,
        [file.id]: {
          id: file.id,
          name: file.name,
          relativePath:
            typeof file.meta?.relativePath === "string"
              ? file.meta.relativePath
              : file.name,
          targetFolderId:
            typeof file.meta?.targetFolderId === "string"
              ? file.meta.targetFolderId
              : undefined,
          targetFolderName:
            typeof file.meta?.targetFolderName === "string"
              ? file.meta.targetFolderName
              : undefined,
          targetPath:
            typeof file.meta?.targetPath === "string"
              ? file.meta.targetPath
              : undefined,
          size: file.size ?? undefined,
          progress: 0,
          status: "queued",
        },
      },
    }));
  });

  uppy.on("upload-start", () => {
    set((state) => {
      const nextFiles = { ...state.files };
      Object.entries(nextFiles).forEach(([id, file]) => {
        if (file.status === "queued") {
          nextFiles[id] = { ...file, status: "uploading" };
        }
      });
      return {
        files: nextFiles,
        isUploading: true,
      };
    });
  });

  uppy.on("upload-progress", (file, progress) => {
    if (!file) return;
    const total = progress.bytesTotal ?? 0;
    const uploaded = progress.bytesUploaded ?? 0;
    const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;

    set((state) => ({
      files: {
        ...state.files,
        [file.id]: {
          ...state.files[file.id],
          progress: percentage,
          status: "uploading",
        },
      },
    }));
  });

  uppy.on("upload-success", (file) => {
    if (!file) return;
    set((state) => ({
      files: {
        ...state.files,
        [file.id]: {
          ...state.files[file.id],
          status: "complete",
          progress: 100,
        },
      },
    }));
  });

  uppy.on("upload-error", (file, error) => {
    if (!file) return;
    set((state) => ({
      files: {
        ...state.files,
        [file.id]: {
          ...state.files[file.id],
          status: "error",
        },
      },
    }));
    console.error("Upload failed:", error);
  });

  uppy.on("file-removed", (file) => {
    if (!file) return;
    set((state) => {
      const newFiles = { ...state.files };
      delete newFiles[file.id];
      return {
        files: newFiles,
        isUploading: Object.values(newFiles).some(
          (uploadFile) =>
            uploadFile.status === "queued" ||
            uploadFile.status === "uploading" ||
            uploadFile.status === "paused",
        ),
      };
    });
  });

  uppy.on("complete", (result) => {
    set({ isUploading: false });
    const failedCount = result?.failed?.length ?? 0;
    if (failedCount > 0) {
      console.warn(`${failedCount} file upload(s) failed`);
    }
  });

  return {
    files: {},
    isUploading: false,

    pauseFile: (id) => {
      const uploader = uppy as typeof uppy & {
        pauseResume: (fileID: string) => boolean;
        getFile: (fileID: string) => { isPaused?: boolean } | undefined;
      };
      uploader.pauseResume(id);
      const isPaused = uploader.getFile(id)?.isPaused ?? false;

      set((state) => ({
        files: {
          ...state.files,
          [id]: state.files[id]
            ? {
                ...state.files[id],
                status: isPaused ? "paused" : "uploading",
              }
            : state.files[id],
        },
      }));
    },

    retryFile: (id) => {
      const uploader = uppy as typeof uppy & {
        retryUpload: (fileID: string) => Promise<unknown>;
      };

      set((state) => ({
        isUploading: true,
        files: {
          ...state.files,
          [id]: state.files[id]
            ? {
                ...state.files[id],
                status: "queued",
              }
            : state.files[id],
        },
      }));

      void uploader.retryUpload(id);
    },

    cancelFile: (id) => {
      uppy.removeFile(id);
    },

    removeFile: (id) =>
      set((state) => {
        const newFiles = { ...state.files };
        delete newFiles[id];
        return { files: newFiles };
      }),

    clearCompleted: () =>
      set((state) => {
        Object.values(state.files).forEach((file) => {
          if (
            file.status === "complete" ||
            file.status === "error" ||
            file.status === "canceled"
          ) {
            uppy.removeFile(file.id);
          }
        });

        const activeFiles: Record<string, UploadFile> = {};
        Object.values(state.files).forEach((file) => {
          if (
            file.status === "queued" ||
            file.status === "uploading" ||
            file.status === "paused"
          ) {
            activeFiles[file.id] = file;
          }
        });
        return {
          files: activeFiles,
          isUploading: Object.keys(activeFiles).length > 0,
        };
      }),
  };
});
