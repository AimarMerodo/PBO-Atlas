"use client";

// Learnset tables with level / TM / egg / tutor tabs and a Gen 9 disclaimer.

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { DictKey } from "@/i18n/dictionaries";
import type { Learnset, MoveInfo } from "@/lib/types";
import TypeBadge from "./TypeBadge";

const CLASS_COLORS: Record<string, string> = {
  physical: "#ef4444",
  special: "#6366f1",
  status: "#9099a1",
};

type TabKey = "level" | "machine" | "egg" | "tutor";
const TABS: { key: TabKey; label: DictKey }[] = [
  { key: "level", label: "moves.level" },
  { key: "machine", label: "moves.machine" },
  { key: "egg", label: "moves.egg" },
  { key: "tutor", label: "moves.tutor" },
];

export default function MovesSection({
  learnset,
  moves,
}: {
  learnset: Learnset;
  moves: Record<string, MoveInfo>;
}) {
  const { lang, t } = useLanguage();
  const available = TABS.filter(({ key }) => (key === "level" ? learnset.level.length : learnset[key].length) > 0);
  const [tab, setTab] = useState<TabKey>(available[0]?.key ?? "level");

  const rows: { slug: string; level?: number }[] =
    tab === "level"
      ? learnset.level.map(([slug, level]) => ({ slug, level }))
      : learnset[tab].map((slug) => ({ slug }));

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200/90">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
        <p>{t("moves.disclaimer")}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {available.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === key
                ? "border-accent bg-accent/20 text-accent-soft"
                : "border-line bg-surface text-ink-dim hover:text-ink"
            }`}
          >
            {t(label)}
            <span className="ml-1.5 text-xs opacity-70">
              {key === "level" ? learnset.level.length : learnset[key].length}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase text-ink-dim">
            <tr>
              {tab === "level" && <th className="px-4 py-2.5">{t("moves.levelCol")}</th>}
              <th className="px-4 py-2.5">{t("moves.name")}</th>
              <th className="px-4 py-2.5">{t("moves.type")}</th>
              <th className="px-4 py-2.5">{t("moves.class")}</th>
              <th className="px-4 py-2.5 text-right">{t("moves.power")}</th>
              <th className="px-4 py-2.5 text-right">{t("moves.accuracy")}</th>
              <th className="px-4 py-2.5 text-right">{t("moves.pp")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ slug, level }) => {
              const move = moves[slug];
              if (!move) return null;
              return (
                <tr key={slug} className="border-t border-line odd:bg-surface even:bg-surface-2/50 hover:bg-surface-2">
                  {tab === "level" && (
                    <td className="px-4 py-1.5 font-mono text-ink-dim">{level === 0 ? "—" : level}</td>
                  )}
                  <td className="px-4 py-1.5 font-medium">{move[lang]}</td>
                  <td className="px-4 py-1.5">
                    <TypeBadge type={move.type} />
                  </td>
                  <td className="px-4 py-1.5">
                    <span className="text-xs font-semibold" style={{ color: CLASS_COLORS[move.class] }}>
                      {t(`class.${move.class}` as DictKey)}
                    </span>
                  </td>
                  <td className="px-4 py-1.5 text-right font-mono text-ink-dim">{move.power ?? "—"}</td>
                  <td className="px-4 py-1.5 text-right font-mono text-ink-dim">{move.accuracy ?? "—"}</td>
                  <td className="px-4 py-1.5 text-right font-mono text-ink-dim">{move.pp ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
