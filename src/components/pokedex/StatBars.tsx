"use client";

import { useT } from "@/i18n/LanguageProvider";
import type { StatName } from "@/lib/types";

const STATS: StatName[] = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
const MAX_STAT = 255;

function statColor(value: number): string {
  if (value < 50) return "#ef4444";
  if (value < 80) return "#f59e0b";
  if (value < 110) return "#84cc16";
  return "#22c55e";
}

export default function StatBars({ stats }: { stats: Record<StatName, number> }) {
  const t = useT();
  const total = STATS.reduce((n, s) => n + (stats[s] ?? 0), 0);

  return (
    <div className="space-y-1.5">
      {STATS.map((stat) => {
        const value = stats[stat] ?? 0;
        return (
          <div key={stat} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 text-ink-dim">{t(`stat.${stat}`)}</span>
            <span className="w-9 shrink-0 text-right font-mono font-semibold">{value}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min((value / MAX_STAT) * 100, 100)}%`, backgroundColor: statColor(value) }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-3 pt-1 text-sm font-semibold">
        <span className="w-20 shrink-0 text-ink-dim">Total</span>
        <span className="w-9 shrink-0 text-right font-mono">{total}</span>
        <div className="flex-1" />
      </div>
    </div>
  );
}
