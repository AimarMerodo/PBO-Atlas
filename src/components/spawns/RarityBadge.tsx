"use client";

import { RARITY_COLORS } from "@/lib/colors";
import { useT } from "@/i18n/LanguageProvider";
import type { DictKey } from "@/i18n/dictionaries";

export default function RarityBadge({ rarity }: { rarity: string }) {
  const t = useT();
  const color = RARITY_COLORS[rarity] ?? "#9099a1";
  const key = `rarity.${rarity}` as DictKey;
  const label = t(key) === key ? rarity : t(key);

  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: `${color}26`, color, border: `1px solid ${color}59` }}
    >
      {label}
    </span>
  );
}
