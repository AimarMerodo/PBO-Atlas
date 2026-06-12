"use client";

import { CircleHelp, Droplet, Fish, Footprints, Mountain, Pickaxe, TreePine, Waves, type LucideIcon } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import type { DictKey } from "@/i18n/dictionaries";

const ICONS: Record<string, LucideIcon> = {
  walking: Footprints,
  surfing: Waves,
  fishing: Fish,
  headbutt: TreePine,
  "rock-smash": Mountain,
  honey: Droplet,
  digging: Pickaxe,
};

export default function MethodIcon({ method, note }: { method: string; note?: string }) {
  const t = useT();
  const key = `method.${method}` as DictKey;
  const label = t(key) === key ? method : t(key);
  const Icon = ICONS[method] ?? CircleHelp;

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm" title={note}>
      <Icon className="h-4 w-4 text-ink-dim" aria-hidden />
      <span className="text-ink-dim">{label}</span>
      {note && <span className="text-xs text-amber-400">({note})</span>}
    </span>
  );
}
