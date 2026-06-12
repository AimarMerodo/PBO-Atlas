import type { Metadata } from "next";
import { getAllPokemonSorted } from "@/lib/data";
import PokedexExplorer from "@/components/pokedex/PokedexExplorer";
import T from "@/components/layout/T";

export const metadata: Metadata = {
  title: "Pokédex",
  description: "Pokédex completa de Pokemon Blaze Online con localizaciones de captura.",
};

export default function PokedexPage() {
  const pokemon = getAllPokemonSorted().map((p) => ({
    slug: p.slug,
    name: p.name,
    id: p.id,
    types: p.types,
    sprite: p.sprite,
    artwork: p.artwork,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
        <T k="pokedex.title" />
      </h1>
      <PokedexExplorer pokemon={pokemon} />
    </div>
  );
}
