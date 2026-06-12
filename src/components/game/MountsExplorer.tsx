"use client";

// Mount gallery, lazy-loaded and filterable by type.

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Mount } from "@/lib/types";
import ItemIcon from "./ItemIcon";

export default function MountsExplorer() {
  const { t } = useLanguage();
  const [mounts, setMounts] = useState<Mount[] | null>(null);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    import("@/data/mounts.json").then((mod) => setMounts(mod.default as Mount[]));
  }, []);

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
          <div key={m.name} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <div className="shrink-0 rounded-lg bg-surface-2 p-1.5">
              <ItemIcon icon={m.icon} size={36} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{m.name}</p>
              <p className="text-[10px] uppercase tracking-wide text-ink-dim">{m.type.replace(/_/g, " ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
