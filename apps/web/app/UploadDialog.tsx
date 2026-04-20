"use client";

import type { FileUploadSnapshot } from "@nextdj/file-explorer";
import { CheckCircle2, LoaderCircle, XCircle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatBytes } from "./lib/format-bytes";

interface UploadDialogProps {
  snapshot: FileUploadSnapshot | null;
}

const DISMISSED_BATCH_KEY = "file-explorer-demo-dismissed-upload-batch";

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  uploading: "Uploading",
  paused: "Paused",
  complete: "Done",
  error: "Failed",
  canceled: "Canceled",
};

export function UploadDialog({ snapshot }: UploadDialogProps) {
  const [dismissed, setDismissed] = useState(false);
  const lastBatchKeyRef = useRef("");

  const batchKey = useMemo(() => {
    if (!snapshot) return "";
    return snapshot.files
      .map((file) => file.id)
      .sort()
      .join("|");
  }, [snapshot]);

  useEffect(() => {
    if (!snapshot || snapshot.summary.fileCount === 0) return;

    if (batchKey !== lastBatchKeyRef.current) {
      lastBatchKeyRef.current = batchKey;
      const dismissedBatchKey =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(DISMISSED_BATCH_KEY)
          : null;
      setDismissed(dismissedBatchKey === batchKey);
    }
  }, [batchKey, snapshot]);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined" && batchKey) {
      window.sessionStorage.setItem(DISMISSED_BATCH_KEY, batchKey);
    }
  };

  if (!snapshot || snapshot.summary.fileCount === 0 || dismissed) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-[120]">
      <div className="pointer-events-auto w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Uploads</p>
            <p className="mt-1 text-xs text-slate-500">
              {snapshot.summary.fileCount} files, {snapshot.summary.activeCount} active
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            onClick={handleDismiss}
            aria-label="Close upload panel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>{snapshot.summary.totalProgress}% complete</span>
            <span>
              {formatBytes(snapshot.summary.uploadedBytes)} /{" "}
              {formatBytes(snapshot.summary.totalBytes)}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${Math.max(snapshot.summary.totalProgress, 3)}%`,
              }}
            />
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto px-3 py-3">
          <div className="space-y-2">
            {snapshot.files.map((file) => (
              <div
                key={file.id}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">
                    {file.status === "complete" ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : file.status === "error" ? (
                      <XCircle size={16} className="text-rose-500" />
                    ) : (
                      <LoaderCircle size={16} className="animate-spin text-slate-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {file.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {file.targetPath || "/"}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-slate-500">
                        {STATUS_LABELS[file.status] ?? file.status}
                      </p>
                    </div>

                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          file.status === "error"
                            ? "bg-rose-400"
                            : file.status === "complete"
                              ? "bg-emerald-500"
                              : "bg-slate-900"
                        }`}
                        style={{ width: `${Math.max(file.progress, 3)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
