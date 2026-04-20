import type { FileNode } from "@nextdj/file-explorer";
import { Clapperboard, Image as ImageIcon, Music2 } from "lucide-react";

type DemoPreviewMeta = {
  previewUrl?: string;
  sourceUrl?: string;
};

export function DemoPreview({ file }: { file: FileNode }) {
  const meta = (file.metadata ?? {}) as DemoPreviewMeta;
  const previewUrl = meta.previewUrl ?? meta.sourceUrl;

  if (file.mediaType === "image" && previewUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-slate-100">
        <img
          src={previewUrl}
          alt={file.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  if (file.mediaType === "video" && previewUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-slate-950">
        <video
          src={previewUrl}
          className="h-full w-full object-cover"
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
        />
      </div>
    );
  }

  if (file.mediaType === "audio" && previewUrl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-100 px-5 text-slate-700">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
          <Music2 size={22} />
        </div>
        <div className="w-full max-w-xs rounded-2xl bg-white p-3 shadow-sm">
          <div className="truncate text-center text-xs font-medium text-slate-500">
            Audio preview
          </div>
          <audio
            src={previewUrl}
            controls
            preload="metadata"
            className="mt-3 w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-100 px-4 text-slate-700">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
        {file.mediaType === "video" ? (
          <Clapperboard size={20} />
        ) : file.mediaType === "audio" ? (
          <Music2 size={20} />
        ) : (
          <ImageIcon size={20} />
        )}
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold">Preview</div>
        <div className="mt-1 line-clamp-2 text-xs text-slate-500">
          {file.name}
        </div>
      </div>
    </div>
  );
}
