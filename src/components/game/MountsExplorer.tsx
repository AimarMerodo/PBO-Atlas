"use client";

// Mount gallery, lazy-loaded and filterable by type.

import { useEffect, useState } from "react";
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

  const filtered = mounts.filter((m) => !group || groupOf(m.type) === group);

  return (
    <div className="space-y-5">
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
