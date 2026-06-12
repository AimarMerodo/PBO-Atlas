// Server-side data loaders. All functions run at build time (SSG) only.

import "server-only";
import fs from "node:fs";
import path from "node:path";
import regions from "@/data/regions.json";
import type { Encounter, Pokedex, PokedexEntry, RegionMapData, RegionSpawns, SpawnLocation } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

export interface RegionMeta {
  id: string;
  name: string;
  order: number;
  description: { es: string; en: string };
}

export function getRegions(): RegionMeta[] {
  return (regions as RegionMeta[]).slice().sort((a, b) => a.order - b.order);
}

const spawnCache = new Map<string, RegionSpawns | null>();

export function getRegionSpawns(regionId: string): RegionSpawns | null {
  if (!spawnCache.has(regionId)) {
    const file = path.join(DATA_DIR, "spawns", `${regionId}.json`);
    spawnCache.set(regionId, fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as RegionSpawns) : null);
  }
  return spawnCache.get(regionId) ?? null;
}

export function getLocation(regionId: string, locationId: string): SpawnLocation | null {
  const region = getRegionSpawns(regionId);
  return region?.locations.find((l) => l.id === locationId) ?? null;
}

let pokedexCache: Pokedex | null = null;

export function getPokedex(): Pokedex {
  if (!pokedexCache) {
    pokedexCache = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "pokedex.json"), "utf8")) as Pokedex;
  }
  return pokedexCache;
}

export function getPokemon(slug: string): PokedexEntry | null {
  return getPokedex()[slug] ?? null;
}

export function getAllPokemonSorted(): PokedexEntry[] {
  return Object.values(getPokedex()).sort((a, b) => a.id - b.id);
}

let encounterIndex: Map<string, Encounter[]> | null = null;

/** Reverse index: pokemon slug -> every place it can be caught. */
export function getEncounters(slug: string): Encounter[] {
  if (!encounterIndex) {
    encounterIndex = new Map();
    for (const meta of getRegions()) {
      const region = getRegionSpawns(meta.id);
      if (!region) continue;
      for (const loc of region.locations) {
        for (const spawn of loc.spawns) {
          const list = encounterIndex.get(spawn.pokemon) ?? [];
          list.push({
            region: meta.id,
            regionName: meta.name,
            locationId: loc.id,
            locationName: loc.name,
            rarity: spawn.rarity,
            time: spawn.time,
            method: spawn.method,
            level: spawn.level,
          });
          encounterIndex.set(spawn.pokemon, list);
        }
      }
    }
  }
  return encounterIndex.get(slug) ?? [];
}

export function getRegionMap(regionId: string): RegionMapData | null {
  const file = path.join(DATA_DIR, "maps", `${regionId}.json`);
  if (!fs.existsSync(file)) return null;
  const map = JSON.parse(fs.readFileSync(file, "utf8")) as RegionMapData;
  const image = path.join(process.cwd(), "public", map.image.replace(/^\//, ""));
  if (!fs.existsSync(image)) return null;
  return map;
}
