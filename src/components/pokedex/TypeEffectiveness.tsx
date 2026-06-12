"use client";

// Defensive type matchup table: what hits this pokemon for x4/x2, what it
// resists and what it's immune to.

import { useT } from "@/i18n/LanguageProvider";
import type { DictKey } from "@/i18n/dictionaries";
import type { DefenseProfile } from "@/lib/type-chart";
import TypeBadge from "./TypeBadge";

const ROWS: { key: keyof DefenseProfile; label: DictKey; accent: string }[] = [
  { key: "x4", label: "eff.x4", accent: "#ef4444" },
  { key: "x2", label: "eff.x2", accent: "#f97316" },
  { key: "half", label: "eff.half", accent: "#22c55e" },
  { key: "quarter", label: "eff.quarter", accent: "#10b981" },
  { key: "immune", label: "eff.immune", accent: "#a1a1aa" },
];

export default function TypeEffectiveness({ profile }: { profile: DefenseProfile }) {
  const t = useT();
  const rows = ROWS.filter((r) => profile[r.key].length > 0);

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      {rows.map((row, i) => (
        <div
          key={row.key}
          className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center ${i % 2 ? "bg-surface-2/50" : "bg-surface"}`}
        >
          <span className="w-36 shrink-0 text-sm font-semibold" style={{ color: row.accent }}>
            {t(row.label)}
          </span>
          <span className="flex flex-wrap gap-1.5">
            {profile[row.key].map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
