import type { Metadata } from "next";
import { getAllPokemonSorted, getEncounters } from "@/lib/data";
import PokedexExplorer from "@/components/pokedex/PokedexExplorer";
import T from "@/components/layout/T";

export const metadata: Metadata = {
  title: "Pokédex",
  description: "Complete Pokemon Blaze Online pokedex with catch locations.",
};

export default function PokedexPage() {
  const pokemon = getAllPokemonSorted().map((p) => {
    const encounters = getEncounters(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      id: p.id,
      types: p.types,
      sprite: p.sprite,
      artwork: p.artwork,
      generation: p.generation,
      bst: Object.values(p.stats).reduce((a, b) => a + b, 0),
      regions: [...new Set(encounters.map((e) => e.region))],
      rarities: [...new Set(encounters.map((e) => e.rarity))],
      evs: (p.evYield ?? []).map((ev) => ev.stat),
    };
  });

  return (
    <div className="space-y-8">
      <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
        <T k="pokedex.title" />
      </h1>
      <PokedexExplorer pokemon={pokemon} />
    </div>
  );
}
