import type { FileNode } from "@nextdj/file-explorer";
import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { formatBytes } from "./lib/format-bytes";

function DetailInfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="min-w-0 text-right text-sm font-medium text-slate-900">
        {value}
      </div>
    </div>
  );
}

export function AppFileDetail({ file }: { file: FileNode }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/80 px-4 py-4 ring-1 ring-slate-200/80">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
          <Info size={12} />
          <span>Demo file details</span>
        </div>
        <div className="space-y-3">
          <DetailInfoRow label="Name" value={file.name} />
          <DetailInfoRow label="Type" value={file.type} />
          <DetailInfoRow
            label="Size"
            value={file.type === "folder" ? "--" : formatBytes(file.size)}
          />
          <DetailInfoRow label="Updated" value={file.updatedAt} />
          <DetailInfoRow label="Parent ID" value={file.parentId || "/"} />
        </div>
      </div>
    </div>
  );
}
