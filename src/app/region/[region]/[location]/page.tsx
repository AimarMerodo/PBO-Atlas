import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocation, getPokedex, getRegions, getRegionSpawns } from "@/lib/data";
import SpawnTable from "@/components/spawns/SpawnTable";
import T from "@/components/layout/T";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRegions().flatMap((r) => {
    const spawns = getRegionSpawns(r.id);
    return spawns ? spawns.locations.map((l) => ({ region: r.id, location: l.id })) : [];
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; location: string }>;
}): Promise<Metadata> {
  const { region, location } = await params;
  const loc = getLocation(region, location);
  const meta = getRegions().find((r) => r.id === region);
  return {
    title: loc && meta ? `${loc.name} (${meta.name}) — Spawns` : "Location",
    description: loc
      ? `Pokemon spawns in ${loc.name}: ${[...new Set(loc.spawns.map((s) => s.displayName))].slice(0, 10).join(", ")}`
      : undefined,
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ region: string; location: string }>;
}) {
  const { region, location } = await params;
  const loc = getLocation(region, location);
  const meta = getRegions().find((r) => r.id === region);
  const regionSpawns = getRegionSpawns(region);
  if (!loc || !meta || !regionSpawns) notFound();

  const pokedex = getPokedex();
  const spawns = loc.spawns.map((s) => ({ ...s, spriteUrl: pokedex[s.pokemon]?.sprite ?? null }));

  return (
    <div className="space-y-6">
      <div>
        <nav className="text-sm text-ink-dim">
          <Link href={`/region/${region}`} className="hover:text-ink transition-colors">
            {meta.name}
          </Link>{" "}
          / <span className="text-ink">{loc.name}</span>
        </nav>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
          <T k="location.spawnsTitle" /> {loc.name}
        </h1>
      </div>

      <SpawnTable spawns={spawns} />

      <p className="text-xs text-ink-dim">
        <a href={regionSpawns.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink underline">
          <T k="location.source" />
        </a>
      </p>
    </div>
  );
}
