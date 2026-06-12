import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPokedex, getRegionMap, getRegions, getRegionSpawns } from "@/lib/data";
import LocationList from "@/components/region/LocationList";
import RegionMap, { type MarkerPreview } from "@/components/region/RegionMap";
import T from "@/components/layout/T";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRegions().map((r) => ({ region: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  const meta = getRegions().find((r) => r.id === region);
  return { title: meta ? `${meta.name} — Spawns` : "Region" };
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const spawns = getRegionSpawns(region);
  const meta = getRegions().find((r) => r.id === region);
  if (!spawns || !meta) notFound();

  const locations = spawns.locations.map((l) => ({
    id: l.id,
    name: l.name,
    speciesCount: new Set(l.spawns.map((s) => s.pokemon)).size,
  }));

  const map = getRegionMap(region);
  let previews: Record<string, MarkerPreview> = {};
  if (map) {
    const pokedex = getPokedex();
    previews = Object.fromEntries(
      spawns.locations.map((l) => [
        l.id,
        {
          locationId: l.id,
          name: l.name,
          speciesCount: new Set(l.spawns.map((s) => s.pokemon)).size,
          topSpawns: l.spawns.slice(0, 3).map((s) => ({
            slug: s.pokemon,
            name: s.displayName,
            spriteUrl: pokedex[s.pokemon]?.spritePbo ?? pokedex[s.pokemon]?.sprite ?? null,
          })),
        },
      ])
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{meta.name}</h1>
        <p className="text-sm text-ink-dim">
          {locations.length} <T k="home.locations" />
        </p>
      </div>

      {map ? (
        <RegionMap map={map} region={region} previews={previews} />
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-sm text-ink-dim">
          <T k="region.noMap" />
        </p>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold">
          <T k="region.locations" />
        </h2>
        <LocationList region={region} locations={locations} />
      </section>
    </div>
  );
}
