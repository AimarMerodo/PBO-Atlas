"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Nature } from "@/lib/types";

export default function NaturesTable({ natures }: { natures: Nature[] }) {
  const { lang, t } = useLanguage();
  const name = (n: Nature) => (lang === "es" ? n.es : lang === "zh" ? n.zh : lang === "pt" ? n.pt : n.name);

  const sorted = [...natures].sort((a, b) => name(a).localeCompare(name(b)));

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs uppercase text-ink-dim">
          <tr>
            <th className="px-4 py-2.5">{t("natures.title")}</th>
            <th className="px-4 py-2.5">{t("natures.up")} (+10%)</th>
            <th className="px-4 py-2.5">{t("natures.down")} (−10%)</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((n) => (
            <tr key={n.name} className="border-t border-line odd:bg-surface even:bg-surface-2/50 hover:bg-surface-2">
              <td className="px-4 py-2 font-medium">
                {name(n)}
                {lang !== "en" && <span className="ml-2 text-xs text-ink-dim">{n.name}</span>}
              </td>
              {n.up ? (
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-green-400">
                    <TrendingUp className="h-4 w-4" aria-hidden /> {t(`stat.${n.up}`)}
                  </span>
                </td>
              ) : (
                <td className="px-4 py-2 text-ink-dim" colSpan={2}>
                  {t("natures.neutral")}
                </td>
              )}
              {n.up && (
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-red-400">
                    <TrendingDown className="h-4 w-4" aria-hidden /> {n.down ? t(`stat.${n.down}`) : "—"}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
