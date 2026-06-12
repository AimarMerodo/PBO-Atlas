"use client";

// Abilities with localized name, hidden badge and description.

import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { AbilityInfo, AbilityRef } from "@/lib/types";

export default function AbilityList({ abilities }: { abilities: (AbilityRef & AbilityInfo)[] }) {
  const { lang, t } = useLanguage();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {abilities.map((a) => (
        <div
          key={a.slug}
          className={`rounded-xl border p-4 ${
            a.hidden ? "border-amber-400/40 bg-amber-400/5" : "border-line bg-surface"
          }`}
        >
          <div className="flex items-center gap-2">
            {a.hidden ? (
              <EyeOff className="h-4 w-4 text-amber-400" aria-hidden />
            ) : (
              <Eye className="h-4 w-4 text-ink-dim" aria-hidden />
            )}
            <span className="font-semibold">{lang === "es" ? a.es : a.en}</span>
            {a.hidden && (
              <span className="rounded-full border border-amber-400/50 bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                {t("ability.hidden")}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-ink-dim">{lang === "es" ? a.textEs : a.textEn}</p>
        </div>
      ))}
    </div>
  );
}
