import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { EvolutionStage, Pokedex } from "@/lib/types";

export default function EvolutionLine({
  line,
  current,
  pokedex,
}: {
  line: EvolutionStage[];
  current: string;
  pokedex: Pokedex;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {line.map((stage, i) => {
        const entry = pokedex[stage.slug];
        const isCurrent = stage.slug === current;
        return (
          <div key={stage.slug} className="flex items-center gap-1">
            {i > 0 && (
              <div className="flex flex-col items-center px-1 text-ink-dim">
                <ArrowRight className="h-4 w-4" aria-hidden />
                {stage.trigger && <span className="max-w-24 text-center text-[10px] leading-tight">{stage.trigger}</span>}
              </div>
            )}
            <Link
              href={`/pokedex/${stage.slug}`}
              className={`flex flex-col items-center rounded-xl border px-3 py-2 transition-colors ${
                isCurrent ? "border-accent bg-accent/10" : "border-line bg-surface hover:border-accent/60"
              }`}
            >
              {entry?.sprite && <Image src={entry.sprite} alt={stage.name} width={56} height={56} unoptimized />}
              <span className="text-xs font-medium">{stage.name}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
