"use client";

import "./styles/theme.css";
import { FileContent, FileDetail } from "./components";
import { FileExplorerContext } from "./context";
import { configureUppy, createTranslator, detectPreferredLocale, resolveLocale } from "./lib";
import { useUploadStore } from "./store/useUploadStore";
import {
  FileExplorerFeatures,
  FileExplorerProps,
  FileExplorerViewControls,
} from "./types";
import { FileUploadDialog } from "./components/FileUploadDialog";
import { useEffect, useState } from "react";

const DEFAULT_FEATURES: Required<FileExplorerFeatures> = {
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
};

const DEFAULT_VIEW_CONTROLS: Required<FileExplorerViewControls> = {
  showDisplayButton: true,
  showViewToggleButton: true,
  showSortOptions: true,
  showSortDirectionOptions: true,
  showHiddenFileOptions: true,
  showTagFilterOption: true,
};

interface FileUploadState {
  open: boolean;
}

interface FileDetailState {
  open: boolean;
  file: FileExplorerProps["files"] extends Array<infer T> ? T | null : any;
}

export function FileExplorer({
  data,
  files,
  breadcrumbs,
  storageInfo,
  showBreadcrumbs = true,
  showToolbar = true,
  viewControls,
  transferTargets,
  dataSource,
  loadDataSourceFolder,
  features,
  lang,
  dateFormat = "YYYY/M/D HH:mm:ss",
  toolbarStyle = "default",
  renderPreview,
  renderDetail,
  onOpen,
  onOpenFolder,
  onNavigateBreadcrumb,
  onTagColorsChange,
  onCreate,
  onRename,
  onDelete,
  onCopy,
  onMove,
  uploadOptions,
  onUploadStateChange,
  appendContextMenuItems,
  hideContextMenuActions,
  replaceContextMenuActions,
  getContextMenuItems,
}: FileExplorerProps) {
  // Keep the public API backward compatible while letting app code pass the
  // backend payload through directly as a single `data` object.
  const finalFiles = data?.files ?? files ?? [];
  const finalBreadcrumbs = data?.breadcrumbs ?? breadcrumbs ?? [];
  const resolvedFeatures = { ...DEFAULT_FEATURES, ...features };
  const resolvedViewControls = { ...DEFAULT_VIEW_CONTROLS, ...viewControls };
  const [resolvedLang, setResolvedLang] = useState(() => resolveLocale(lang));

  const [uploadState, setUploadState] = useState<FileUploadState>({
    open: false,
  });
  const [detailState, setDetailState] = useState<FileDetailState>({
    open: false,
    file: null,
  });

  useEffect(() => {
    configureUppy(uploadOptions);
  }, [uploadOptions]);

  useEffect(() => {
    if (lang) {
      setResolvedLang(resolveLocale(lang));
      return;
    }

    setResolvedLang(detectPreferredLocale());
  }, [lang]);

  const t = createTranslator(resolvedLang);

  const handleOpenUploadDialog = () => {
    const { files: uploadFiles, clearCompleted } = useUploadStore.getState();
    const hasActiveUploads = Object.values(uploadFiles).some(
      (file) =>
        file.status === "queued" ||
        file.status === "uploading" ||
        file.status === "paused",
    );

    if (!hasActiveUploads) {
      clearCompleted();
    }

    setUploadState({ open: true });
  };

  return (
    <div className="fe-theme">
      <FileExplorerContext.Provider
        value={{
          lang: resolvedLang,
          t,
          dateFormat,
          breadcrumbs: finalBreadcrumbs,
          storageInfo,
          showBreadcrumbs,
          showToolbar,
          viewControls: resolvedViewControls,
          transferTargets,
          dataSource,
          loadDataSourceFolder,
          features: resolvedFeatures,
          toolbarStyle,
          renderPreview,
          renderDetail,
          onOpen,
          onOpenFolder,
          onNavigateBreadcrumb,
          onTagColorsChange,
          onCreate,
          onRename,
          onDelete,
          onCopy,
          onMove,
          openFileDetail: (file) => setDetailState({ open: true, file }),
          closeFileDetail: () => setDetailState({ open: false, file: null }),
          openUploadDialog: handleOpenUploadDialog,
          closeUploadDialog: () => setUploadState({ open: false }),
          appendContextMenuItems,
          hideContextMenuActions,
          replaceContextMenuActions,
          getContextMenuItems,
        }}
      >
        <FileUploadDialog
          open={uploadState.open}
          onClose={() => setUploadState({ open: false })}
          onUploadStateChange={onUploadStateChange}
        />
        <FileDetail
          open={detailState.open}
          file={detailState.file}
          onClose={() => setDetailState({ open: false, file: null })}
        >
          {detailState.file ? renderDetail?.(detailState.file) : null}
        </FileDetail>
        <FileContent files={finalFiles} breadcrumbs={finalBreadcrumbs} />
      </FileExplorerContext.Provider>
    </div>
  );
}
