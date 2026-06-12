"use client";

// Mount gallery, lazy-loaded and filterable by type.

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { slugifyName } from "@/lib/slug";
import type { Mount } from "@/lib/types";
import ItemIcon from "./ItemIcon";
import GameModal from "./GameModal";

export default function MountsExplorer() {
  const { t } = useLanguage();
  const [mounts, setMounts] = useState<Mount[] | null>(null);
  const [type, setType] = useState<string | null>(null);
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
        />
      )}
    </div>
  );
}
