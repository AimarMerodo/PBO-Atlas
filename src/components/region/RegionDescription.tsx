"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

export default function RegionDescription({ description }: { description: { es: string; en: string } }) {
  const { lang } = useLanguage();
  return <>{description[lang]}</>;
}
