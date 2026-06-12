"use client";

// Item detail dialog: large icon, localized names, and cross-references
// (move taught by TMs, pokemon evolved by stones).

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { GameItem } from "@/lib/types";
import TypeBadge from "@/components/pokedex/TypeBadge";
import GameModal from "./GameModal";

export default function ItemModal({ item, onClose }: { item: GameItem; onClose: () => void }) {
  const { lang, t } = useLanguage();
  const localName =
    (lang === "es" ? item.es : lang === "zh" ? item.zh : lang === "pt" ? item.pt : null) ?? item.name;

  return (
    <GameModal
      title={localName}
      subtitle={localName !== item.name ? item.name : null}
      badge={item.category}
      icon={item.icon}
      onClose={onClose}
    >
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
    </GameModal>
  );
}
