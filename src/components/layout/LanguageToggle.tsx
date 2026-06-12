"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type { Lang } from "@/i18n/dictionaries";

const LANGS: Lang[] = ["es", "en"];

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex rounded-lg border border-line overflow-hidden text-xs font-semibold">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1.5 uppercase transition-colors ${
            lang === l ? "bg-accent text-white" : "bg-surface text-ink-dim hover:text-ink"
          }`}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
