"use client";

import type { ReactNode } from "react";
import type { FileNode } from "../types";
import { Folder, X } from "lucide-react";
import { Button } from "./Button";
import { useFileExplorerContext } from "../context";
import { cn, getFileConfig } from "../lib";
import { Tooltip } from "./Tooltip";

interface FileDetailProps {
  open: boolean;
  file?: FileNode | null;
  onClose: () => void;
  children?: ReactNode;
}

export const FileDetail = ({
  open,
  file,
  onClose,
  children,
}: FileDetailProps) => {
  const { lang, t } = useFileExplorerContext();

  if (!open || !file) return null;

  const visual = getFileConfig(file.name, lang);
  const hasCustomContent = children !== null && children !== undefined;

  return (
    <div className="fixed inset-0 z-10020">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="absolute top-0 right-0 h-full w-full max-w-115 border-l border-(--_fe-border) bg-(--_fe-bg) shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-(--_fe-border) px-5 py-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-[0.14em] text-(--_fe-text-muted) uppercase">
                {t("detail.title")}
              </p>
              <div className="mt-3 flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                    file.type === "folder"
                      ? "bg-amber-50 text-amber-500"
                      : visual.bgClass,
                    file.type === "file" && visual.color,
                  )}
                >
                  {file.type === "folder" ? (
                    <Folder size={22} />
                  ) : (
                    <visual.Icon size={22} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <Tooltip content={file.name}>
                    <h3 className="truncate text-lg font-semibold text-(--_fe-selected)">
                      {file.name}
                    </h3>
                  </Tooltip>
                  <p className="mt-1 text-sm text-(--_fe-text-muted)">
                    {file.type === "folder"
                      ? t("detail.folderDescription")
                      : `${visual.category} · ${visual.label}`}
                  </p>
                </div>
              </div>
            </div>
            <Button
              icon={X}
              variant="ghost"
              tip={t("action.close")}
              onClick={onClose}
              className="shrink-0"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              {hasCustomContent ? children : null}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
