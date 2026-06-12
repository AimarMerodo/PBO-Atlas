"use client";

// Tiny client leaf for rendering translated UI strings inside server components.
import { useT } from "@/i18n/LanguageProvider";
import type { DictKey } from "@/i18n/dictionaries";

export default function T({ k }: { k: DictKey }) {
  const t = useT();
  return <>{t(k)}</>;
}
