"use client";

// "Where to catch" table on the pokemon detail page, grouped by region.

import Link from "next/link";
import { useT } from "@/i18n/LanguageProvider";
import { RARITY_ORDER } from "@/lib/colors";
import type { Encounter, EvolutionStage } from "@/lib/types";
import RarityBadge from "@/components/spawns/RarityBadge";
import TimeIcon from "@/components/spawns/TimeIcon";
import MethodIcon from "@/components/spawns/MethodIcon";

export default function CatchLocations({
  encounters,
  catchableAncestors,
}: {
  encounters: Encounter[];
  catchableAncestors: EvolutionStage[];
}) {
  const t = useT();

  if (encounters.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-4 py-5 text-sm text-ink-dim">
        <p>{t("pokemon.notCatchable")}</p>
        {catchableAncestors.length > 0 && (
          <p className="mt-2">
            {t("pokemon.tryEvolving")}{" "}
            {catchableAncestors.map((a, i) => (
              <span key={a.slug}>
                {i > 0 && ", "}
                <Link href={`/pokedex/${a.slug}`} className="font-medium text-accent-soft hover:underline">
                  {a.name}
                </Link>
              </span>
            ))}
            .
          </p>
        )}
      </div>
    );
  }

  const sorted = [...encounters].sort(
    (a, b) =>
      a.regionName.localeCompare(b.regionName) ||
      (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9) ||
      a.locationName.localeCompare(b.locationName)
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead className="bg-surface-2 text-left text-xs uppercase text-ink-dim">
          <tr>
            <th className="px-4 py-2.5">{t("pokemon.region")}</th>
            <th className="px-4 py-2.5">{t("pokemon.location")}</th>
            <th className="px-4 py-2.5">{t("spawn.rarity")}</th>
            <th className="px-4 py-2.5">{t("spawn.time")}</th>
            <th className="px-4 py-2.5">{t("spawn.method")}</th>
            <th className="px-4 py-2.5">{t("spawn.level")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((e, i) => (
            <tr key={`${e.region}-${e.locationId}-${i}`} className="border-t border-line odd:bg-surface even:bg-surface-2/50 hover:bg-surface-2">
              <td className="px-4 py-2 text-ink-dim">{e.regionName}</td>
              <td className="px-4 py-2">
                <Link href={`/region/${e.region}/${e.locationId}`} className="font-medium hover:text-accent-soft transition-colors">
                  {e.locationName}
                </Link>
              </td>
              <td className="px-4 py-2"><RarityBadge rarity={e.rarity} /></td>
              <td className="px-4 py-2"><TimeIcon time={e.time} /></td>
              <td className="px-4 py-2"><MethodIcon method={e.method} /></td>
              <td className="px-4 py-2 whitespace-nowrap text-ink-dim">
                {e.level ? (e.level.min === e.level.max ? e.level.min : `${e.level.min}–${e.level.max}`) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
