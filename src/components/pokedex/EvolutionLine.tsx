"use client";

// Evolution line with large artwork cards and localized trigger pills.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import TypeBadge from "./TypeBadge";

export interface EvoStage {
  slug: string;
  name: string;
  trigger?: string;
  id: number | null;
  artwork: string | null;
  types: string[];
}

/** Localize PokeAPI-derived trigger strings like "level 16", "use Thunder Stone, day". */
function useTriggerLabel() {
  const { t } = useLanguage();
  return (trigger: string): string =>
    trigger
      .split(", ")
      .map((part) => {
        let m = part.match(/^level (\d+)$/i);
        if (m) return `${t("evo.level")} ${m[1]}`;
        m = part.match(/^use (.+)$/i);
        if (m) return `${t("evo.use")} ${m[1]}`;
        m = part.match(/^hold (.+)$/i);
        if (m) return `${t("evo.hold")} ${m[1]}`;
        m = part.match(/^knows (.+)$/i);
        if (m) return `${t("evo.knows")} ${m[1]}`;
        m = part.match(/^at (.+)$/i);
        if (m) return `${t("evo.at")} ${m[1]}`;
        if (/^high friendship$/i.test(part)) return t("evo.friendship");
        if (/^trade$/i.test(part)) return t("evo.trade");
        if (/^day$/i.test(part)) return t("evo.day");
        if (/^night$/i.test(part)) return t("evo.night");
        if (/^special$/i.test(part)) return t("evo.special");
        return part;
      })
      .join(" · ");
}

export default function EvolutionLine({ stages, current }: { stages: EvoStage[]; current: string }) {
  const triggerLabel = useTriggerLabel();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
      {stages.map((stage, i) => {
        const isCurrent = stage.slug === current;
        return (
          <div key={stage.slug} className="flex flex-wrap items-center justify-center gap-3">
            {i > 0 && (
              <div className="flex flex-col items-center gap-1.5 px-1">
                <ArrowRight className="h-6 w-6 text-ink-dim" aria-hidden />
                {stage.trigger && (
                  <span className="max-w-36 rounded-full border border-accent/50 bg-accent/10 px-3 py-1 text-center text-xs font-semibold leading-tight text-accent-soft">
                    {triggerLabel(stage.trigger)}
                  </span>
                )}
              </div>
            )}
            <Link
              href={`/pokedex/${stage.slug}`}
              className={`group flex w-40 flex-col items-center rounded-2xl border p-4 transition-all hover:-translate-y-0.5 ${
                isCurrent ? "border-accent bg-accent/10" : "border-line bg-surface hover:border-accent/60"
              }`}
            >
              {stage.id !== null && (
                <span className="self-end font-mono text-[10px] text-ink-dim">#{String(stage.id).padStart(3, "0")}</span>
              )}
              {stage.artwork ? (
                <Image
                  src={stage.artwork}
                  alt={stage.name}
                  width={110}
                  height={110}
                  unoptimized
                  className="drop-shadow-md transition-transform duration-200 group-hover:scale-110"
                />
              ) : (
                <div className="h-[110px] w-[110px]" />
              )}
              <span className="mt-2 text-center text-sm font-semibold leading-tight">{stage.name}</span>
              {stage.types.length > 0 && (
                <span className="mt-1.5 flex gap-1">
                  {stage.types.map((tp) => (
                    <TypeBadge key={tp} type={tp} />
                  ))}
                </span>
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
