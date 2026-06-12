"use client";

// Client component: spawn table for one location with text/rarity/time/method filters.

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useT } from "@/i18n/LanguageProvider";
import { RARITY_ORDER } from "@/lib/colors";
import type { Spawn } from "@/lib/types";
import RarityBadge from "./RarityBadge";
import TimeIcon from "./TimeIcon";
import MethodIcon from "./MethodIcon";

interface SpawnWithSprite extends Spawn {
  spriteUrl: string | null;
}

const RARITY_FILTERS = ["common", "uncommon", "rare", "very-rare", "ultra-rare", "legendary"] as const;

export default function SpawnTable({ spawns }: { spawns: SpawnWithSprite[] }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);

  const methods = useMemo(() => [...new Set(spawns.map((s) => s.method))], [spawns]);
  const times = useMemo(() => [...new Set(spawns.map((s) => s.time))], [spawns]);

  const filtered = spawns.filter((s) => {
    if (query && !s.displayName.toLowerCase().includes(query.trim().toLowerCase())) return false;
    if (rarity && s.rarity !== rarity) return false;
    if (time && s.time !== time) return false;
    if (method && s.method !== method) return false;
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9) || a.displayName.localeCompare(b.displayName)
  );

  const chip = (active: boolean) =>
    `rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
      active ? "border-accent bg-accent/20 text-accent-soft" : "border-line bg-surface text-ink-dim hover:text-ink"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("location.searchPlaceholder")}
          className="w-full sm:w-64 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none placeholder:text-ink-dim focus:border-accent/60"
        />
        <div className="flex flex-wrap gap-1.5">
          {RARITY_FILTERS.filter((r) => spawns.some((s) => s.rarity === r)).map((r) => (
            <button key={r} className={chip(rarity === r)} onClick={() => setRarity(rarity === r ? null : r)}>
              {t(`rarity.${r}`)}
            </button>
          ))}
        </div>
        {times.length > 1 && (
          <div className="flex gap-1.5">
            {times.map((tm) => (
              <button key={tm} className={chip(time === tm)} onClick={() => setTime(time === tm ? null : tm)}>
                {t(`time.${tm}` as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        )}
        {methods.length > 1 && (
          <div className="flex gap-1.5">
            {methods.map((m) => (
              <button key={m} className={chip(method === m)} onClick={() => setMethod(method === m ? null : m)}>
                {t(`method.${m}` as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-6 text-sm text-ink-dim">{t("location.noResults")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase text-ink-dim">
              <tr>
                <th className="px-4 py-2.5" colSpan={2}>{t("spawn.pokemon")}</th>
                <th className="px-4 py-2.5">{t("spawn.rarity")}</th>
                <th className="px-4 py-2.5">{t("spawn.time")}</th>
                <th className="px-4 py-2.5">{t("spawn.method")}</th>
                <th className="px-4 py-2.5">{t("spawn.level")}</th>
                <th className="px-4 py-2.5">{t("spawn.evs")}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={`${s.pokemon}-${s.method}-${i}`} className="border-t border-line odd:bg-surface even:bg-surface-2/50 hover:bg-surface-2">
                  <td className="w-12 py-1.5 pl-3">
                    {s.spriteUrl && <Image src={s.spriteUrl} alt="" width={40} height={40} unoptimized />}
                  </td>
                  <td className="px-2 py-1.5">
                    <Link href={`/pokedex/${s.pokemon}`} className="font-medium hover:text-accent-soft transition-colors">
                      {s.displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-1.5"><RarityBadge rarity={s.rarity} /></td>
                  <td className="px-4 py-1.5"><TimeIcon time={s.time} /></td>
                  <td className="px-4 py-1.5"><MethodIcon method={s.method} note={s.methodNote} /></td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-ink-dim">
                    {s.level ? (s.level.min === s.level.max ? s.level.min : `${s.level.min}–${s.level.max}`) : "—"}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-ink-dim">
                    {s.evs.length ? s.evs.map((e) => `+${e.amount} ${t(`stat.${e.stat}`)}`).join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
