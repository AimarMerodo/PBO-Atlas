import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAbilityDetails, getAllPokemonSorted, getEncounters, getLearnset, getPokedex, getPokemon } from "@/lib/data";
import { defenseProfile } from "@/lib/type-chart";
import TypeBadge from "@/components/pokedex/TypeBadge";
import StatBars from "@/components/pokedex/StatBars";
import EvolutionLine from "@/components/pokedex/EvolutionLine";
import CatchLocations from "@/components/pokedex/CatchLocations";
import PokemonArtwork from "@/components/pokedex/PokemonArtwork";
import AbilityList from "@/components/pokedex/AbilityList";
import TypeEffectiveness from "@/components/pokedex/TypeEffectiveness";
import MovesSection from "@/components/pokedex/MovesSection";
import T from "@/components/layout/T";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPokemonSorted().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pokemon = getPokemon(slug);
  if (!pokemon) return { title: "Pokemon" };
  const places = getEncounters(slug)
    .map((e) => e.locationName)
    .slice(0, 6);
  return {
    title: pokemon.name,
    description: places.length
      ? `Where to catch ${pokemon.name} in Pokemon Blaze Online: ${places.join(", ")}`
      : `${pokemon.name} in Pokemon Blaze Online`,
  };
}

export default async function PokemonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pokemon = getPokemon(slug);
  if (!pokemon) notFound();

  const pokedex = getPokedex();
  const encounters = getEncounters(slug);

  // Pre-evolutions of this pokemon that CAN be caught (for the
  // "not catchable — evolve from X" hint).
  const catchableAncestors =
    encounters.length === 0 && pokemon.evolutionLine
      ? pokemon.evolutionLine.filter((m) => m.slug !== slug && getEncounters(m.slug).length > 0)
      : [];

  const learnsetData = getLearnset(slug);
  const abilities = getAbilityDetails(pokemon.abilities);

  const evoStages = (pokemon.evolutionLine ?? []).map((m) => {
    const entry = pokedex[m.slug];
    return {
      slug: m.slug,
      name: m.name,
      trigger: m.trigger,
      id: entry?.id ?? null,
      artwork: entry?.artwork ?? null,
      types: entry?.types ?? [],
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <PokemonArtwork name={pokemon.name} artwork={pokemon.artwork} artworkShiny={pokemon.artworkShiny ?? null} />
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm text-ink-dim">#{pokemon.id}</p>
            <h1 className="text-3xl font-extrabold tracking-tight">{pokemon.name}</h1>
            <div className="mt-2 flex gap-1.5">
              {pokemon.types.map((tp) => (
                <TypeBadge key={tp} type={tp} />
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-ink-dim"><T k="pokemon.height" /></dt>
              <dd className="font-medium">{pokemon.heightM} m</dd>
            </div>
            <div>
              <dt className="text-ink-dim"><T k="pokemon.weight" /></dt>
              <dd className="font-medium">{pokemon.weightKg} kg</dd>
            </div>
            {pokemon.generation && (
              <div>
                <dt className="text-ink-dim"><T k="pokemon.generation" /></dt>
                <dd className="font-medium">{pokemon.generation}</dd>
              </div>
            )}
          </dl>
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase text-ink-dim"><T k="pokemon.stats" /></h2>
            <StatBars stats={pokemon.stats} />
          </div>
        </div>
      </div>

      {abilities.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold"><T k="pokemon.abilities" /></h2>
          <AbilityList abilities={abilities} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold"><T k="pokemon.defenses" /></h2>
        <TypeEffectiveness profile={defenseProfile(pokemon.types)} />
      </section>

      {evoStages.length > 1 && (
        <section>
          <h2 className="mb-3 text-lg font-bold"><T k="pokemon.evolutionLine" /></h2>
          <EvolutionLine stages={evoStages} current={slug} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold"><T k="pokemon.whereToCatch" /></h2>
        <CatchLocations encounters={encounters} catchableAncestors={catchableAncestors} />
      </section>

      {learnsetData && (
        <section>
          <h2 className="mb-3 text-lg font-bold"><T k="pokemon.moves" /></h2>
          <MovesSection learnset={learnsetData.learnset} moves={learnsetData.moves} />
        </section>
      )}

      <p className="text-xs text-ink-dim">
        <Link href="/pokedex" className="inline-flex items-center gap-1 hover:text-ink underline">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> <T k="pokedex.title" />
        </Link>
      </p>
    </div>
  );
}
