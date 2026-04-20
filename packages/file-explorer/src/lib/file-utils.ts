import {
  Archive,
  Database,
  FileCode2,
  FileIcon,
  FileSpreadsheet,
  FileText,
  FileType2,
  Image,
  Music,
  Presentation,
  Text,
  Video,
} from "lucide-react";
import { createTranslator, getCategoryLabel, resolveLocale } from "./i18n";
import type { FileExplorerLocale } from "../types";

type FileCategoryKey =
  | "document"
  | "text"
  | "spreadsheet"
  | "presentation"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "code"
  | "data"
  | "database"
  | "file";

type FileVisualConfig = {
  Icon: typeof FileIcon;
  color: string;
  bgClass: string;
  label: string;
  categoryKey: FileCategoryKey;
};

type FileVisual = Omit<FileVisualConfig, "categoryKey"> & {
  category: string;
};

const EXT_MAP: Record<string, FileVisualConfig> = {
  pdf: {
    Icon: FileText,
    color: "text-rose-400",
    bgClass: "bg-rose-50",
    label: "PDF",
    categoryKey: "document",
  },
  doc: {
    Icon: FileText,
    color: "text-sky-400",
    bgClass: "bg-sky-50",
    label: "DOC",
    categoryKey: "document",
  },
  docx: {
    Icon: FileText,
    color: "text-sky-400",
    bgClass: "bg-sky-50",
    label: "DOCX",
    categoryKey: "document",
  },
  txt: {
    Icon: FileType2,
    color: "text-slate-500",
    bgClass: "bg-slate-100",
    label: "TXT",
    categoryKey: "text",
  },
  md: {
    Icon: Text,
    color: "text-slate-500",
    bgClass: "bg-slate-100",
    label: "MD",
    categoryKey: "text",
  },
  xls: {
    Icon: FileSpreadsheet,
    color: "text-emerald-400",
    bgClass: "bg-emerald-50",
    label: "XLS",
    categoryKey: "spreadsheet",
  },
  xlsx: {
    Icon: FileSpreadsheet,
    color: "text-emerald-400",
    bgClass: "bg-emerald-50",
    label: "XLSX",
    categoryKey: "spreadsheet",
  },
  csv: {
    Icon: FileSpreadsheet,
    color: "text-emerald-400",
    bgClass: "bg-emerald-50",
    label: "CSV",
    categoryKey: "spreadsheet",
  },
  ppt: {
    Icon: Presentation,
    color: "text-orange-400",
    bgClass: "bg-orange-50",
    label: "PPT",
    categoryKey: "presentation",
  },
  pptx: {
    Icon: Presentation,
    color: "text-orange-400",
    bgClass: "bg-orange-50",
    label: "PPTX",
    categoryKey: "presentation",
  },
  jpg: {
    Icon: Image,
    color: "text-teal-400",
    bgClass: "bg-teal-50",
    label: "JPG",
    categoryKey: "image",
  },
  jpeg: {
    Icon: Image,
    color: "text-teal-400",
    bgClass: "bg-teal-50",
    label: "JPEG",
    categoryKey: "image",
  },
  png: {
    Icon: Image,
    color: "text-teal-400",
    bgClass: "bg-teal-50",
    label: "PNG",
    categoryKey: "image",
  },
  gif: {
    Icon: Image,
    color: "text-teal-400",
    bgClass: "bg-teal-50",
    label: "GIF",
    categoryKey: "image",
  },
  webp: {
    Icon: Image,
    color: "text-teal-400",
    bgClass: "bg-teal-50",
    label: "WEBP",
    categoryKey: "image",
  },
  mp4: {
    Icon: Video,
    color: "text-violet-400",
    bgClass: "bg-violet-50",
    label: "MP4",
    categoryKey: "video",
  },
  mov: {
    Icon: Video,
    color: "text-violet-400",
    bgClass: "bg-violet-50",
    label: "MOV",
    categoryKey: "video",
  },
  webm: {
    Icon: Video,
    color: "text-violet-400",
    bgClass: "bg-violet-50",
    label: "WEBM",
    categoryKey: "video",
  },
  mp3: {
    Icon: Music,
    color: "text-pink-400",
    bgClass: "bg-pink-50",
    label: "MP3",
    categoryKey: "audio",
  },
  wav: {
    Icon: Music,
    color: "text-pink-400",
    bgClass: "bg-pink-50",
    label: "WAV",
    categoryKey: "audio",
  },
  flac: {
    Icon: Music,
    color: "text-pink-400",
    bgClass: "bg-pink-50",
    label: "FLAC",
    categoryKey: "audio",
  },
  zip: {
    Icon: Archive,
    color: "text-amber-400",
    bgClass: "bg-amber-50",
    label: "ZIP",
    categoryKey: "archive",
  },
  rar: {
    Icon: Archive,
    color: "text-amber-400",
    bgClass: "bg-amber-50",
    label: "RAR",
    categoryKey: "archive",
  },
  "7z": {
    Icon: Archive,
    color: "text-amber-400",
    bgClass: "bg-amber-50",
    label: "7Z",
    categoryKey: "archive",
  },
  ts: {
    Icon: FileCode2,
    color: "text-sky-400",
    bgClass: "bg-sky-50",
    label: "TS",
    categoryKey: "code",
  },
  tsx: {
    Icon: FileCode2,
    color: "text-cyan-400",
    bgClass: "bg-cyan-50",
    label: "TSX",
    categoryKey: "code",
  },
  js: {
    Icon: FileCode2,
    color: "text-amber-400",
    bgClass: "bg-amber-50",
    label: "JS",
    categoryKey: "code",
  },
  jsx: {
    Icon: FileCode2,
    color: "text-sky-400",
    bgClass: "bg-sky-50",
    label: "JSX",
    categoryKey: "code",
  },
  json: {
    Icon: FileCode2,
    color: "text-yellow-500",
    bgClass: "bg-yellow-50",
    label: "JSON",
    categoryKey: "data",
  },
  sql: {
    Icon: Database,
    color: "text-orange-500",
    bgClass: "bg-orange-50",
    label: "SQL",
    categoryKey: "database",
  },
};

const getTranslator = (locale?: string | FileExplorerLocale) =>
  createTranslator(resolveLocale(locale));

export const getFileConfig = (
  fileName: string,
  locale?: string | FileExplorerLocale,
): FileVisual => {
  const t = getTranslator(locale);
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const matched = EXT_MAP[ext];

  if (matched) {
    return {
      Icon: matched.Icon,
      color: matched.color,
      bgClass: matched.bgClass,
      label: matched.label,
      category: getCategoryLabel(matched.categoryKey, t),
    };
  }

  return {
    Icon: FileIcon,
    color: "text-slate-500",
    bgClass: "bg-slate-100",
    label: (ext || "FILE").slice(0, 6).toUpperCase(),
    category: getCategoryLabel("file", t),
  };
};

export const getFileCategoryLabel = (
  file: {
    type: "file" | "folder";
    name: string;
    mediaType?: string;
  },
  locale?: string | FileExplorerLocale,
) => {
  const t = getTranslator(locale);

  if (file.type === "folder") return getCategoryLabel("folder", t);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const matched = EXT_MAP[ext];
  if (matched) return getCategoryLabel(matched.categoryKey, t);

  if (file.mediaType === "image") return getCategoryLabel("image", t);
  if (file.mediaType === "video") return getCategoryLabel("video", t);
  if (file.mediaType === "audio") return getCategoryLabel("audio", t);

  return getCategoryLabel("file", t);
};
