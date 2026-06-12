import { en, type DictKey } from "./locales/en";
import { es } from "./locales/es";
import { zh } from "./locales/zh";
import { pt } from "./locales/pt";

export type Lang = "en" | "es" | "zh" | "pt";
export type { DictKey };

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "zh", label: "中文" },
  { code: "pt", label: "PT" },
];

export const dictionaries: Record<Lang, Record<DictKey, string>> = { en, es, zh, pt };
