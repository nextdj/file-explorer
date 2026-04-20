import type { CategoryColor, FileAction, FileExplorerLocale } from "../../types";
import type { Primitive, TranslationDictionary } from "./types";
import { enMessages } from "./locales/en";
import { zh_CNMessages } from "./locales/zh-CN";
import { zh_TWMessages } from "./locales/zh-TW";
import { jaMessages } from "./locales/ja";
import { koMessages } from "./locales/ko";
import { frMessages } from "./locales/fr";
import { deMessages } from "./locales/de";
import { esMessages } from "./locales/es";
import { pt_BRMessages } from "./locales/pt-BR";
import { ruMessages } from "./locales/ru";

const TRANSLATIONS: Record<FileExplorerLocale, TranslationDictionary> = {
  en: enMessages,
  "zh-CN": zh_CNMessages,
  "zh-TW": zh_TWMessages,
  ja: jaMessages,
  ko: koMessages,
  fr: frMessages,
  de: deMessages,
  es: esMessages,
  "pt-BR": pt_BRMessages,
  ru: ruMessages,
};

const LOCALE_ALIASES: Array<[string, FileExplorerLocale]> = [
  ["zh-hk", "zh-TW"],
  ["zh-mo", "zh-TW"],
  ["zh-tw", "zh-TW"],
  ["zh", "zh-CN"],
  ["pt-br", "pt-BR"],
  ["pt", "pt-BR"],
  ["ja", "ja"],
  ["ko", "ko"],
  ["fr", "fr"],
  ["de", "de"],
  ["es", "es"],
  ["ru", "ru"],
  ["en", "en"],
];

export function resolveLocale(input?: string | null): FileExplorerLocale {
  if (!input) return "en";
  const normalized = input.toLowerCase();

  for (const [prefix, locale] of LOCALE_ALIASES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}-`)) {
      return locale;
    }
  }

  return "en";
}

export function detectPreferredLocale(): FileExplorerLocale {
  if (typeof navigator === "undefined") return "en";
  const candidate = navigator.languages?.[0] || navigator.language;
  return resolveLocale(candidate);
}

const interpolate = (
  template: string,
  vars?: Record<string, Primitive>,
): string => {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value === undefined ? "" : String(value);
  });
};

export function createTranslator(locale: FileExplorerLocale) {
  return (key: string, vars?: Record<string, Primitive>) => {
    const table = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
    const fallback = TRANSLATIONS.en[key] ?? key;
    return interpolate(table[key] ?? fallback, vars);
  };
}

export function getActionLabel(
  action: FileAction,
  t: ReturnType<typeof createTranslator>,
) {
  const map: Record<FileAction, string> = {
    preview: "action.open",
    download: "action.download",
    edit: "action.detail",
    copy: "action.copy",
    move: "action.move",
    rename: "action.rename",
    delete: "action.delete",
  };

  return t(map[action]);
}

export function getColorLabel(
  color: CategoryColor,
  t: ReturnType<typeof createTranslator>,
) {
  return t(`color.${color}`);
}

export function getCategoryLabel(
  category:
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
    | "file"
    | "folder",
  t: ReturnType<typeof createTranslator>,
) {
  return t(`category.${category}`);
}
