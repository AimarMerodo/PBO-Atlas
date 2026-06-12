"use client";

// Pokedex grid with name/number search, type filter and catchable toggle.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useT } from "@/i18n/LanguageProvider";
import { TYPE_COLORS } from "@/lib/colors";
import TypeBadge from "./TypeBadge";

export interface PokedexCard {
  slug: string;
  name: string;
  id: number;
  types: string[];
  sprite: string | null;
  caught: boolean;
}

export default function PokedexExplorer({ pokemon }: { pokemon: PokedexCard[] }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [onlyCatchable, setOnlyCatchable] = useState(false);

  const q = query.trim().toLowerCase();
  const filtered = pokemon.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && String(p.id) !== q) return false;
    if (type && !p.types.includes(type)) return false;
    if (onlyCatchable && !p.caught) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("pokedex.searchPlaceholder")}
          className="w-full sm:w-72 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none placeholder:text-ink-dim focus:border-accent/60"
        />
        <select
          value={type ?? ""}
          onChange={(e) => setType(e.target.value || null)}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none"
        >
          <option value="">{t("pokedex.allTypes")}</option>
          {Object.keys(TYPE_COLORS).map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-dim">
          <input
            type="checkbox"
            checked={onlyCatchable}
            onChange={(e) => setOnlyCatchable(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          {t("pokedex.onlyCatchable")}
        </label>
        <span className="ml-auto text-xs text-ink-dim">
          {filtered.length} {t("pokedex.results")}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-6 text-sm text-ink-dim">{t("pokedex.noResults")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/pokedex/${p.slug}`}
              className="group flex flex-col items-center rounded-xl border border-line bg-surface p-3 transition-colors hover:border-accent/60"
            >
              <span className="self-end text-[10px] text-ink-dim">#{p.id}</span>
              {p.sprite ? (
                <Image src={p.sprite} alt={p.name} width={72} height={72} unoptimized className="transition-transform group-hover:scale-110" />
              ) : (
                <div className="h-[72px] w-[72px]" />
              )}
              <span className="mt-1 text-center text-sm font-medium leading-tight">{p.name}</span>
              <span className="mt-1.5 flex gap-1">
                {p.types.map((tp) => (
                  <TypeBadge key={tp} type={tp} />
                ))}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
