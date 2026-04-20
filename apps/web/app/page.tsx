import { headers } from "next/headers";
import { getSeededStorages } from "./file-service";
import { FileList } from "./FileList";
import type { FileExplorerLocale } from "@nextdj/file-explorer";

interface PageProps {
  searchParams?: {
    parentId?: string;
  };
}

const SUPPORTED_LOCALES: FileExplorerLocale[] = [
  "en",
  "zh-CN",
  "zh-TW",
  "ja",
  "ko",
  "fr",
  "de",
  "es",
  "pt-BR",
  "ru",
];

function resolveRequestLocale(
  acceptLanguage?: string | null,
): FileExplorerLocale {
  const value = acceptLanguage?.toLowerCase() ?? "";

  if (
    value.includes("zh-tw") ||
    value.includes("zh-hk") ||
    value.includes("zh-mo")
  ) {
    return "zh-TW";
  }

  if (value.includes("zh")) return "zh-CN";
  if (value.includes("pt-br") || value.includes("pt")) return "pt-BR";
  if (value.includes("ja")) return "ja";
  if (value.includes("ko")) return "ko";
  if (value.includes("fr")) return "fr";
  if (value.includes("de")) return "de";
  if (value.includes("es")) return "es";
  if (value.includes("ru")) return "ru";
  if (value.includes("en")) return "en";

  return "en";
}

export default async function Page({ searchParams }: PageProps) {
  const requestHeaders = headers();
  const lang = resolveRequestLocale(requestHeaders.get("accept-language"));
  const initialStorages = getSeededStorages();

  return (
    <div className="px-6">
      <FileList
        initialData={null}
        initialStorages={initialStorages}
        lang={lang}
      />
    </div>
  );
}
