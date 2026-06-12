import type { Metadata } from "next";
import { getAllPokemonSorted, getEncounters } from "@/lib/data";
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
    caught: getEncounters(p.slug).length > 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">
        <T k="pokedex.title" />
      </h1>
      <PokedexExplorer pokemon={pokemon} />
    </div>
  );
}
