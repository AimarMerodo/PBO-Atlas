"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

export default function RegionDescription({ description }: { description: Record<string, string> }) {
  const { lang } = useLanguage();
  return <>{description[lang] ?? description.en}</>;
}
