"use client";

// Pokemon artwork with a normal/shiny toggle.

import { useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";

export default function PokemonArtwork({
  name,
  artwork,
  artworkShiny,
  spritePbo,
  spritePboShiny,
}: {
  name: string;
  artwork: string | null;
  artworkShiny: string | null;
  spritePbo?: string | null;
  spritePboShiny?: string | null;
}) {
  const t = useT();
  const [shiny, setShiny] = useState(false);
  const src = shiny && artworkShiny ? artworkShiny : artwork;
  const gameSprite = shiny && spritePboShiny ? spritePboShiny : spritePbo;

  return (
    <div className="relative flex shrink-0 items-center justify-center rounded-2xl border border-line bg-gradient-to-br from-surface to-surface-2 p-6 sm:w-64">
      {artworkShiny && (
        <button
          onClick={() => setShiny(!shiny)}
          aria-pressed={shiny}
          title={t("pokemon.shiny")}
          className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
            shiny
              ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
              : "border-line bg-surface text-ink-dim hover:text-ink"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Shiny
        </button>
      )}
      {src && <Image src={src} alt={shiny ? `${name} shiny` : name} width={200} height={200} priority unoptimized />}
      {gameSprite && (
        <Image
          src={gameSprite}
          alt={`${name} in-game`}
          width={64}
          height={64}
          unoptimized
          className="absolute bottom-2 left-2 [image-rendering:pixelated]"
          title="In-game sprite"
        />
      )}
    </div>
  );
}
