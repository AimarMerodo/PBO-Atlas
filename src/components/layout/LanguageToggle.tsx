"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { LANGS } from "@/i18n/dictionaries";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex rounded-lg border border-line overflow-hidden text-xs font-semibold">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2 py-1.5 transition-colors ${
            lang === l.code ? "bg-accent text-white" : "bg-surface text-ink-dim hover:text-ink"
          }`}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
