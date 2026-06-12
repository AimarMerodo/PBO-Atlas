"use client";

// Mount gallery, lazy-loaded and filterable by type.

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { slugifyName } from "@/lib/slug";
import type { Mount, SearchIndex } from "@/lib/types";
import ItemIcon from "./ItemIcon";
import GameModal from "./GameModal";

/**
 * Most mounts are pokemon: derive the showdown id of the ridden pokemon so
 * the modal can show its animated battle sprite (shiny when the mount is).
 */
function mountPokemonAni(name: string, index: SearchIndex | null): string | null {
  if (!index) return null;
  const shiny = /\(shiny/i.test(name);
  let base = name
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+surf mount$/i, "")
    .replace(/\s+mount$/i, "")
    .trim();
  // Regional/mega prefixes: "Alolan-Ninetales" -> "Ninetales Alola"
  base = base
    .replace(/^alolan[- ](.+)$/i, "$1 Alola")
    .replace(/^galarian[- ](.+)$/i, "$1 Galar")
    .replace(/^hisuian[- ](.+)$/i, "$1 Hisui")
    .replace(/^mega (.+?)[- ]?([xy])?$/i, (_, p, xy) => `${p} Mega${xy ? ` ${xy.toUpperCase()}` : ""}`);
  const hit = index.pokemon.find((p) => p.name.toLowerCase() === base.toLowerCase());
  const showdownId = hit?.sprite?.match(/\/([a-z0-9]+)\.png$/)?.[1];
  if (!showdownId) return null;
  return `https://play.pokemonshowdown.com/sprites/ani${shiny ? "-shiny" : ""}/${showdownId}.gif`;
}

export default function MountsExplorer() {
  const { t } = useLanguage();
  const [mounts, setMounts] = useState<Mount[] | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [selected, setSelected] = useState<Mount | null>(null);
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [aniFailed, setAniFailed] = useState(false);

  useEffect(() => {
    import("@/data/mounts.json").then((mod) => {
      const list = mod.default as Mount[];
      setMounts(list);
      const slug = new URLSearchParams(window.location.search).get("mount");
      if (slug) setSelected(list.find((m) => slugifyName(m.name) === slug) ?? null);
    });
    import("@/data/search-index.json").then((mod) => setIndex(mod.default as unknown as SearchIndex));
  }, []);

  const select = (mount: Mount | null) => {
    setSelected(mount);
    setAniFailed(false);
    const url = new URL(window.location.href);
    if (mount) url.searchParams.set("mount", slugifyName(mount.name));
    else url.searchParams.delete("mount");
    window.history.replaceState(null, "", url.toString());
  };

  const types = useMemo(() => (mounts ? [...new Set(mounts.map((m) => m.type).filter(Boolean))].sort() : []), [mounts]);

  if (!mounts) return <p className="py-10 text-center text-sm text-ink-dim">...</p>;

  const filtered = mounts.filter((m) => !type || m.type === type);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-2">
        <select
          value={type ?? ""}
          onChange={(e) => setType(e.target.value || null)}
          className="rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-ink outline-none"
        >
          <option value="">{t("mounts.allTypes")}</option>
          {types.map((tp) => (
            <option key={tp} value={tp}>
              {tp.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-dim tabular-nums">
          {filtered.length} {t("pokedex.results")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((m) => (
          <button
            key={m.name}
            onClick={() => select(m)}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-accent/60"
          >
            <div className="shrink-0 rounded-lg bg-zinc-300/80 p-1.5">
              <ItemIcon icon={m.icon} size={36} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{m.name}</p>
              <p className="text-[10px] uppercase tracking-wide text-ink-dim">{m.type.replace(/_/g, " ")}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <GameModal
          title={selected.name}
          badge={selected.type.replace(/_/g, " ")}
          icon={selected.icon}
          onClose={() => select(null)}
        >
          {(() => {
            const ani = mountPokemonAni(selected.name, index);
            if (!ani || aniFailed) return null;
            return (
              <div className="mt-4 flex justify-center rounded-xl border border-line bg-gradient-to-br from-surface-2 to-bg p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ani}
                  alt={selected.name}
                  onError={() => setAniFailed(true)}
                  className="max-h-32 w-auto scale-[1.4] [image-rendering:pixelated]"
                />
              </div>
            );
          })()}
        </GameModal>
      )}
    </div>
  );
}
