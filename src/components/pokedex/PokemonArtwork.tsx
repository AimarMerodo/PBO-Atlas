"use client";

// Pokemon artwork with a normal/shiny toggle and the animated battle sprite
// (same Showdown-style animation the game uses).

import { useEffect, useState } from "react";
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
  const [aniFailed, setAniFailed] = useState(false);
  const src = shiny && artworkShiny ? artworkShiny : artwork;
  const gameSprite = shiny && spritePboShiny ? spritePboShiny : spritePbo;

  // Showdown id derived from the in-game sprite filename (same naming).
  const showdownId = spritePbo?.match(/\/([a-z0-9]+)\.png$/)?.[1] ?? null;
  const aniUrl = showdownId
    ? `https://play.pokemonshowdown.com/sprites/ani${shiny ? "-shiny" : ""}/${showdownId}.gif`
    : null;

  useEffect(() => {
    setAniFailed(false);
  }, [shiny]);

  return (
    <div className="relative flex min-h-72 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface to-surface-2 p-6 sm:w-72">
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
      {aniUrl && !aniFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={aniUrl}
          alt={shiny ? `${name} shiny` : name}
          onError={() => setAniFailed(true)}
          className="max-h-40 w-auto scale-[1.75] [image-rendering:pixelated]"
        />
      ) : src ? (
        <Image src={src} alt={shiny ? `${name} shiny` : name} width={200} height={200} priority unoptimized />
      ) : (
        gameSprite && (
          <Image src={gameSprite} alt={name} width={120} height={120} unoptimized className="[image-rendering:pixelated]" />
        )
      )}
    </div>
  );
}
