"use client";

// Cosmetic bundle gallery: cards with piece icons, click for the detail modal.

import { useEffect, useState } from "react";
import { Shirt } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { CosmeticBundle } from "@/lib/types";
import ItemIcon from "./ItemIcon";
import GameModal from "./GameModal";

const prettyName = (name: string) => name.replace(/ Bundle| Costume/g, "");

export default function CosmeticsExplorer({ bundles }: { bundles: CosmeticBundle[] }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<CosmeticBundle | null>(null);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("bundle");
    if (slug) setSelected(bundles.find((b) => b.slug === slug) ?? null);
  }, [bundles]);

  const select = (bundle: CosmeticBundle | null) => {
    setSelected(bundle);
    const url = new URL(window.location.href);
    if (bundle) url.searchParams.set("bundle", bundle.slug);
    else url.searchParams.delete("bundle");
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {bundles.map((b) => (
          <button
            key={b.slug}
            onClick={() => select(b)}
            className="rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-accent/60"
          >
            <p className="flex items-center gap-2 font-semibold">
              {b.icon ? (
                <ItemIcon icon={b.icon} size={24} />
              ) : (
                <Shirt className="h-4 w-4 text-accent-soft" aria-hidden />
              )}
              {prettyName(b.name)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {b.items.slice(0, 8).map((item, i) => (
                <div key={`${item.name}-${i}`} className="rounded-lg bg-zinc-300/80 p-1" title={item.name}>
                  <ItemIcon icon={item.icon} size={28} />
                </div>
              ))}
              {b.items.length > 8 && (
                <span className="self-center text-xs text-ink-dim">+{b.items.length - 8}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <GameModal title={prettyName(selected.name)} icon={selected.icon} onClose={() => select(null)}>
          <p className="mt-4 text-xs uppercase tracking-wide text-ink-dim">{t("cosmetics.includes")}</p>
          <ul className="mt-2 space-y-1.5">
            {selected.items.map((item, i) => (
              <li key={`${item.name}-${i}`} className="flex items-center gap-2.5 text-sm">
                <div className="rounded-lg bg-zinc-300/80 p-1">
                  <ItemIcon icon={item.icon} size={30} />
                </div>
                {item.name}
              </li>
            ))}
          </ul>
        </GameModal>
      )}
    </>
  );
}
