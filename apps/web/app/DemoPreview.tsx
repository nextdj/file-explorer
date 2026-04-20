import type { FileNode } from "@nextdj/file-explorer";

export function DemoPreview({ file }: { file: FileNode }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-100 px-4 text-slate-700">
      <div className="text-center">
        <div className="text-sm font-semibold">Preview</div>
        <div className="mt-1 line-clamp-2 text-xs text-slate-500">
          {file.name}
        </div>
      </div>
    </div>
  );
}
