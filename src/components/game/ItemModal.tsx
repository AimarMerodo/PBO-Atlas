"use client";

// Item detail dialog: large icon, localized names, and cross-references
// (move taught by TMs, pokemon evolved by stones).

import Link from "next/link";
import { X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { GameItem } from "@/lib/types";
import TypeBadge from "@/components/pokedex/TypeBadge";
import ItemIcon from "./ItemIcon";

export default function ItemModal({ item, onClose }: { item: GameItem; onClose: () => void }) {
  const { lang, t } = useLanguage();
  const localName =
    (lang === "es" ? item.es : lang === "zh" ? item.zh : lang === "pt" ? item.pt : null) ?? item.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={localName}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold leading-tight">{localName}</h2>
            {localName !== item.name && <p className="text-sm text-ink-dim">{item.name}</p>}
            <span className="mt-1 inline-block rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-dim">
              {item.category}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-line bg-surface-2 p-1.5 text-ink-dim transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex justify-center rounded-xl border border-line bg-gradient-to-br from-surface-2 to-bg p-6">
          <div className="[image-rendering:pixelated]">
            <ItemIcon icon={item.icon} size={160} />
          </div>
        </div>

        {item.description && <p className="mt-4 text-sm leading-relaxed text-ink-dim">{item.description}</p>}

        {item.teaches && (
          <p className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-ink-dim">{t("item.teaches")}:</span>
            <span className="font-semibold">{item.teaches.name}</span>
            {item.teaches.type && <TypeBadge type={item.teaches.type} />}
          </p>
        )}

        {item.evolves && item.evolves.length > 0 && (
          <div className="mt-3 text-sm">
            <p className="text-ink-dim">{t("item.evolves")}:</p>
            <p className="mt-1 flex flex-wrap gap-1.5">
              {item.evolves.map((p) => (
                <Link
                  key={p.slug}
                  href={`/pokedex/${p.slug}`}
                  className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-0.5 font-medium text-accent-soft transition-colors hover:bg-accent/20"
                >
                  {p.name}
                </Link>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
