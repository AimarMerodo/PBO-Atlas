"use client";

// Item dex: lazy-loads the full item list, searchable and filterable.

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { GameItem } from "@/lib/types";
import ItemIcon from "./ItemIcon";
import ItemModal from "./ItemModal";

const PAGE_SIZE = 48;

export default function ItemsExplorer() {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<GameItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GameItem | null>(null);

  useEffect(() => {
    import("@/data/items.json").then((mod) => {
      const list = (mod.default as { items: GameItem[] }).items;
      setItems(list);
      // Shareable deep link: /items?item=<slug>
      const slug = new URLSearchParams(window.location.search).get("item");
      if (slug) setSelected(list.find((i) => i.slug === slug) ?? null);
    });
  }, []);

  const select = (item: GameItem | null) => {
    setSelected(item);
    const url = new URL(window.location.href);
    if (item) url.searchParams.set("item", item.slug);
    else url.searchParams.delete("item");
    window.history.replaceState(null, "", url.toString());
  };

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  const categories = useMemo(
    () => (items ? [...new Set(items.map((i) => i.category))].sort() : []),
    [items]
  );

  if (!items) return <p className="py-10 text-center text-sm text-ink-dim">...</p>;

  const localName = (i: GameItem) =>
    (lang === "es" ? i.es : lang === "zh" ? i.zh : lang === "pt" ? i.pt : null) ?? i.name;

  const q = query.trim().toLowerCase();
  const filtered = items.filter((i) => {
    if (q && !i.name.toLowerCase().includes(q) && !localName(i).toLowerCase().includes(q)) return false;
    if (category && i.category !== category) return false;
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("items.searchPlaceholder")}
            className="w-full rounded-xl border border-line bg-surface py-2 pl-10 pr-3 text-sm outline-none placeholder:text-ink-dim focus:border-accent/60"
          />
        </div>
        <select
          value={category ?? ""}
          onChange={(e) => setCategory(e.target.value || null)}
          className="rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink outline-none"
        >
          <option value="">{t("items.allCategories")}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-dim tabular-nums">
          {filtered.length} {t("pokedex.results")}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {visible.map((i) => (
          <button
            key={i.id}
            onClick={() => select(i)}
            className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-accent/60"
          >
            <div className="shrink-0 rounded-lg bg-surface-2 p-1.5">
              <ItemIcon icon={i.icon} size={36} />
            </div>
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold">{localName(i)}</span>
                <span className="text-[10px] uppercase tracking-wide text-ink-dim">{i.category}</span>
              </p>
              <p className="text-xs leading-snug text-ink-dim">{i.description}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && <ItemModal item={selected} onClose={() => select(null)} />}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(1, current - 1))}
            disabled={current === 1}
            aria-label={t("pagination.prev")}
            className="rounded-lg border border-line bg-surface p-2 text-ink-dim transition-colors enabled:hover:text-ink disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-ink-dim tabular-nums">
            {current} {t("pagination.of")} {pageCount}
          </span>
          <button
            onClick={() => setPage(Math.min(pageCount, current + 1))}
            disabled={current === pageCount}
            aria-label={t("pagination.next")}
            className="rounded-lg border border-line bg-surface p-2 text-ink-dim transition-colors enabled:hover:text-ink disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
