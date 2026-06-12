"use client";

// Pokedex grid with name/number search, type filter and catchable toggle.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import { TYPE_COLORS } from "@/lib/colors";
import TypeBadge from "./TypeBadge";

const PAGE_SIZE = 30;

/** Page numbers to render: first, last, and a window around the current. */
function pageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("...");
    out.push(p);
    prev = p;
  }
  return out;
}

export interface PokedexCard {
  slug: string;
  name: string;
  id: number;
  types: string[];
  sprite: string | null;
  artwork: string | null;
}

export default function PokedexExplorer({ pokemon }: { pokemon: PokedexCard[] }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, type]);

  const q = query.trim().toLowerCase();
  const filtered = pokemon.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && String(p.id) !== q) return false;
    if (type && !p.types.includes(type)) return false;
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
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 1}
          aria-label={t("pagination.prev")}
          className="rounded-lg border border-line bg-surface p-2 text-ink-dim transition-colors enabled:hover:text-ink disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pageList(current, pageCount).map((p, i) =>
          p === "..." ? (
            <span key={`gap-${i}`} className="px-1.5 text-sm text-ink-dim">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              aria-current={p === current ? "page" : undefined}
              className={`min-w-9 rounded-lg border px-2.5 py-1.5 text-sm tabular-nums transition-colors ${
                p === current
                  ? "border-accent bg-accent font-semibold text-white"
                  : "border-line bg-surface text-ink-dim hover:text-ink"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === pageCount}
          aria-label={t("pagination.next")}
          className="rounded-lg border border-line bg-surface p-2 text-ink-dim transition-colors enabled:hover:text-ink disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    ) : null;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="relative mx-auto w-full max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-dim" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("pokedex.searchPlaceholder")}
            autoFocus
            className="w-full rounded-2xl border border-line bg-surface py-3.5 pl-12 pr-4 text-lg shadow-lg outline-none transition-colors placeholder:text-ink-dim focus:border-accent/70 focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
          <select
            value={type ?? ""}
            onChange={(e) => setType(e.target.value || null)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm capitalize outline-none"
          >
            <option value="">{t("pokedex.allTypes")}</option>
            {Object.keys(TYPE_COLORS).map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </select>
          <span className="ml-auto text-xs text-ink-dim">
            {filtered.length} {t("pokedex.results")}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-6 text-sm text-ink-dim">{t("pokedex.noResults")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((p) => {
            const tint = TYPE_COLORS[p.types[0]] ?? "#9099a1";
            return (
              <Link
                key={p.slug}
                href={`/pokedex/${p.slug}`}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/60"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-25 transition-opacity group-hover:opacity-40"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${tint}, transparent 70%)` }}
                />
                <span className="self-end font-mono text-xs text-ink-dim">#{String(p.id).padStart(3, "0")}</span>
                {p.artwork || p.sprite ? (
                  <Image
                    src={(p.artwork ?? p.sprite) as string}
                    alt={p.name}
                    width={130}
                    height={130}
                    unoptimized
                    className="relative drop-shadow-lg transition-transform duration-200 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-[130px] w-[130px]" />
                )}
                <span className="mt-3 text-center text-base font-semibold leading-tight">{p.name}</span>
                <span className="mt-2 flex gap-1.5">
                  {p.types.map((tp) => (
                    <TypeBadge key={tp} type={tp} />
                  ))}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {pager}
    </div>
  );
}
