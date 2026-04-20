import { getUploadOptions, hasUploadEndpoint, uppy } from "../lib";

const getDefaultErrorMessage = (error: unknown, file: File) => {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (message.includes("exceeds maximum allowed size")) {
    return `${file.name} exceeds the current maximum file size`;
  }

  if (message.includes("you can only upload")) {
    return `${file.name} has a file type that is not allowed`;
  }

  if (message.includes("Cannot add the duplicate file")) {
    return `${file.name} is already in the upload queue`;
  }

  if (message) {
    return `${file.name} failed validation before upload: ${message}`;
  }

  return `${file.name} failed validation before upload`;
};

export const useUppyUpload = () => {
  const addFiles = (
    fileList: FileList | File[],
    extraMeta?: Record<string, string>,
    onError?: (message: string) => void,
    options?: {
      missingEndpointMessage?: string;
      getErrorMessage?: (error: unknown, file: File) => string;
    },
  ): number => {
    let addedCount = 0;
    const uploadOptions = getUploadOptions();
    if (!hasUploadEndpoint()) {
      const message =
        options?.missingEndpointMessage ??
        "Upload endpoint is not configured. The app must pass uploadOptions.endpoint first.";
      console.error(
        "[file-explorer] Missing uploadOptions.endpoint. App must provide a Tus endpoint before uploading files.",
      );
      onError?.(message);
      return 0;
    }

    Array.from(fileList).forEach((file) => {
      try {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
          meta: {
            ...uploadOptions.metadata,
            ...extraMeta,
            // Preserve the relative path when uploading folders.
            relativePath: (file as any).webkitRelativePath || file.name,
          },
        });
        addedCount += 1;
      } catch (err) {
        const message =
          options?.getErrorMessage?.(err, file) ??
          getDefaultErrorMessage(err, file);
        console.warn(message);
        onError?.(message);
      }
    });

    return addedCount;
  };

  return { addFiles, uppy };
};
