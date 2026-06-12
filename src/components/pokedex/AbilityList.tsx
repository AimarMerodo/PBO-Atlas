"use client";

// Abilities with localized name, hidden badge and description.

import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Lang } from "@/i18n/dictionaries";
import type { AbilityInfo, AbilityRef } from "@/lib/types";

function abilityName(a: AbilityInfo, lang: Lang): string {
  if (lang === "es") return a.es;
  if (lang === "zh") return a.zh || a.en;
  return a.en; // en + pt (no official Portuguese ability names)
}

function abilityText(a: AbilityInfo, lang: Lang): string {
  const detail =
    lang === "es" ? a.detailEs : lang === "zh" ? a.detailZh : lang === "pt" ? a.detailPt : a.detail;
  return detail || a.detail || a.textEn;
}

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
            <span className="font-semibold">{abilityName(a, lang)}</span>
            {a.hidden && (
              <span className="rounded-full border border-amber-400/50 bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                {t("ability.hidden")}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{abilityText(a, lang)}</p>
        </div>
      ))}
    </div>
  );
}
