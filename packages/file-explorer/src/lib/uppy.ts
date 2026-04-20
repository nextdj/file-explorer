import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import type { FileExplorerUploadOptions } from "../types";

const DEFAULT_UPLOAD_OPTIONS: Required<
  Omit<FileExplorerUploadOptions, "headers" | "metadata" | "allowedFileTypes"> & {
    headers: Record<string, string>;
    metadata: Record<string, string>;
    allowedFileTypes: string[];
  }
> = {
  endpoint: "",
  headers: {},
  metadata: {},
  withCredentials: false,
  autoProceed: true,
  chunkSize: 5 * 1024 * 1024,
  retryDelays: [0, 1000, 3000, 5000],
  maxNumberOfFiles: 20000,
  maxFileSize: 1024 * 1024 * 1000 * 100,
  allowedFileTypes: [],
};

let currentUploadOptions: typeof DEFAULT_UPLOAD_OPTIONS = {
  ...DEFAULT_UPLOAD_OPTIONS,
};

export const uppy = new Uppy({
  id: "main-uploader",
  autoProceed: DEFAULT_UPLOAD_OPTIONS.autoProceed,
  restrictions: {
    maxNumberOfFiles: DEFAULT_UPLOAD_OPTIONS.maxNumberOfFiles,
    maxFileSize: DEFAULT_UPLOAD_OPTIONS.maxFileSize,
  },
}).use(Tus, {
  endpoint: DEFAULT_UPLOAD_OPTIONS.endpoint,
  headers: DEFAULT_UPLOAD_OPTIONS.headers,
  withCredentials: DEFAULT_UPLOAD_OPTIONS.withCredentials,
  retryDelays: DEFAULT_UPLOAD_OPTIONS.retryDelays,
  chunkSize: DEFAULT_UPLOAD_OPTIONS.chunkSize,
});

export const configureUppy = (options?: FileExplorerUploadOptions) => {
  currentUploadOptions = {
    ...DEFAULT_UPLOAD_OPTIONS,
    ...options,
    headers: options?.headers ?? DEFAULT_UPLOAD_OPTIONS.headers,
    metadata: options?.metadata ?? DEFAULT_UPLOAD_OPTIONS.metadata,
    retryDelays: options?.retryDelays ?? DEFAULT_UPLOAD_OPTIONS.retryDelays,
    allowedFileTypes:
      options?.allowedFileTypes ?? DEFAULT_UPLOAD_OPTIONS.allowedFileTypes,
  };

  uppy.setOptions({
    autoProceed: currentUploadOptions.autoProceed,
    restrictions: {
      maxNumberOfFiles: currentUploadOptions.maxNumberOfFiles,
      maxFileSize: currentUploadOptions.maxFileSize,
      allowedFileTypes:
        currentUploadOptions.allowedFileTypes.length > 0
          ? currentUploadOptions.allowedFileTypes
          : undefined,
    },
  });

  const tus = uppy.getPlugin("Tus");
  tus?.setOptions({
    endpoint: currentUploadOptions.endpoint,
    headers: currentUploadOptions.headers,
    withCredentials: currentUploadOptions.withCredentials,
    retryDelays: currentUploadOptions.retryDelays,
    chunkSize: currentUploadOptions.chunkSize,
  });
};

export const getUploadOptions = () => currentUploadOptions;
export const hasUploadEndpoint = () => Boolean(currentUploadOptions.endpoint);
