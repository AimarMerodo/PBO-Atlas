"use client";

// Mount gallery, lazy-loaded and filterable by type.

import { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { slugifyName } from "@/lib/slug";
import type { DictKey } from "@/i18n/dictionaries";
import type { Mount } from "@/lib/types";
import ItemIcon from "./ItemIcon";
import GameModal from "./GameModal";

type MountGroup = "land" | "surf" | "others";

const GROUPS: { key: MountGroup; label: DictKey }[] = [
  { key: "land", label: "mounts.land" },
  { key: "surf", label: "mounts.surf" },
  { key: "others", label: "mounts.others" },
];

const groupOf = (type: string): MountGroup =>
  type === "LAND_POKEMON" ? "land" : type === "SURF_POKEMON" ? "surf" : "others";

export default function MountsExplorer() {
  const { t } = useLanguage();
  const [mounts, setMounts] = useState<Mount[] | null>(null);
  const [group, setGroup] = useState<MountGroup | null>(null);
  const [query, setQuery] = useState("");
  const [onlyShiny, setOnlyShiny] = useState(false);
  const [selected, setSelected] = useState<Mount | null>(null);

  useEffect(() => {
    import("@/data/mounts.json").then((mod) => {
      const list = mod.default as Mount[];
      setMounts(list);
      const slug = new URLSearchParams(window.location.search).get("mount");
      if (slug) setSelected(list.find((m) => slugifyName(m.name) === slug) ?? null);
    });
  }, []);

  const select = (mount: Mount | null) => {
    setSelected(mount);
    const url = new URL(window.location.href);
    if (mount) url.searchParams.set("mount", slugifyName(mount.name));
    else url.searchParams.delete("mount");
    window.history.replaceState(null, "", url.toString());
  };

  if (!mounts) return <p className="py-10 text-center text-sm text-ink-dim">...</p>;

  const q = query.trim().toLowerCase();
  const filtered = mounts.filter((m) => {
    if (group && groupOf(m.type) !== group) return false;
    if (q && !m.name.toLowerCase().includes(q)) return false;
    if (onlyShiny && !/shiny/i.test(m.name)) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="relative mx-auto w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("mounts.searchPlaceholder")}
          className="w-full rounded-xl border border-line bg-surface py-2 pl-10 pr-3 text-sm outline-none placeholder:text-ink-dim focus:border-accent/60"
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setGroup(group === g.key ? null : g.key)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              group === g.key
                ? "border-accent bg-accent/20 text-accent-soft"
                : "border-line bg-surface text-ink-dim hover:text-ink"
            }`}
          >
            {t(g.label)}
          </button>
        ))}
        <button
          onClick={() => setOnlyShiny(!onlyShiny)}
          aria-pressed={onlyShiny}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            onlyShiny
              ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
              : "border-line bg-surface text-ink-dim hover:text-ink"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {t("mounts.onlyShiny")}
        </button>
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
              <p className="text-[10px] uppercase tracking-wide text-ink-dim">
                {t(GROUPS.find((g) => g.key === groupOf(m.type))!.label)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <GameModal
          title={selected.name}
          badge={t(GROUPS.find((g) => g.key === groupOf(selected.type))!.label)}
          icon={selected.icon}
          onClose={() => select(null)}
        />
      )}
    </div>
  );
}
