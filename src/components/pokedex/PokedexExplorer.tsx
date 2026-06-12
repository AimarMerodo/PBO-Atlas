"use client";

// Pokedex grid with name/number search, type filter and catchable toggle.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import { TYPE_COLORS } from "@/lib/colors";
import TypeBadge from "./TypeBadge";

const PAGE_SIZE = 60;

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
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, type, onlyCatchable]);

  const q = query.trim().toLowerCase();
  const filtered = pokemon.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && String(p.id) !== q) return false;
    if (type && !p.types.includes(type)) return false;
    if (onlyCatchable && !p.caught) return false;
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pager =
    pageCount > 1 ? (
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 1}
          aria-label={t("pagination.prev")}
          className="rounded-lg border border-line bg-surface p-1.5 text-ink-dim transition-colors enabled:hover:text-ink disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-ink-dim tabular-nums">
          {current} {t("pagination.of")} {pageCount}
        </span>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === pageCount}
          aria-label={t("pagination.next")}
          className="rounded-lg border border-line bg-surface p-1.5 text-ink-dim transition-colors enabled:hover:text-ink disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    ) : null;

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
          {visible.map((p) => (
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

      {pager}
    </div>
  );
}
