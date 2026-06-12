"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import type { SearchIndex } from "@/lib/types";


export default function SearchDialog() {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openDialog = useCallback(() => {
    setOpen(true);
    if (!index) {
      import("@/data/search-index.json").then((mod) => setIndex(mod.default as unknown as SearchIndex));
    }
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openDialog();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openDialog]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else setQuery("");
  }, [open]);

  const q = query.trim().toLowerCase();
  const pokemon = q && index ? index.pokemon.filter((p) => p.name.toLowerCase().includes(q) || String(p.id) === q).slice(0, 8) : [];
  const locations = q && index ? index.locations.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 8) : [];

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={openDialog}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink-dim hover:text-ink transition-colors"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{t("nav.search")}</span>
        <kbd className="hidden md:inline rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-dim">Ctrl K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-line bg-surface shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="w-full bg-transparent px-4 py-3 text-base outline-none border-b border-line placeholder:text-ink-dim"
            />
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {q && pokemon.length === 0 && locations.length === 0 && (
                <p className="px-3 py-4 text-sm text-ink-dim">{index ? t("search.noResults") : "..."}</p>
              )}
              {pokemon.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase text-ink-dim">{t("search.pokemon")}</p>
                  {pokemon.map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => go(`/pokedex/${p.slug}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2"
                    >
                      {p.sprite ? <Image src={p.sprite} alt="" width={32} height={32} unoptimized /> : <span className="w-8" />}
                      <span className="text-sm">{p.name}</span>
                      <span className="ml-auto text-xs text-ink-dim">#{p.id}</span>
                    </button>
                  ))}
                </div>
              )}
              {locations.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase text-ink-dim">{t("search.locations")}</p>
                  {locations.map((l) => (
                    <button
                      key={`${l.region}-${l.id}`}
                      onClick={() => go(`/region/${l.region}/${l.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2"
                    >
                      <MapPin className="h-4 w-4 text-ink-dim" aria-hidden />
                      <span className="text-sm">{l.name}</span>
                      <span className="ml-auto text-xs capitalize text-ink-dim">{l.region}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
