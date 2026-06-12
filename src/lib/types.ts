// Shared TypeScript contracts for the JSON data produced by scripts/.

export type Rarity = "common" | "uncommon" | "rare" | "very-rare" | "ultra-rare" | "legendary" | string;
export type SpawnTime = "all" | "day" | "night";
export type SpawnMethod = "walking" | "surfing" | "fishing" | "headbutt" | "rock-smash" | "honey" | "digging" | string;
export type StatName = "hp" | "attack" | "defense" | "special-attack" | "special-defense" | "speed";

export interface EvYield {
  stat: StatName;
  amount: number;
}

export interface Spawn {
  pokemon: string; // PokeAPI slug
  displayName: string;
  rarity: Rarity;
  time: SpawnTime;
  method: SpawnMethod;
  methodNote?: string;
  level: { min: number; max: number } | null;
  evs: EvYield[];
  raw: Record<string, string>;
}

export interface SpawnLocation {
  id: string;
  name: string;
  spawns: Spawn[];
}

export interface RegionSpawns {
  region: string;
  name: string;
  sourceUrl: string;
  scrapedAt: string;
  locations: SpawnLocation[];
}

export interface EvolutionStage {
  slug: string;
  name: string;
  trigger?: string;
}

export interface AbilityRef {
  slug: string;
  hidden: boolean;
}

export interface AbilityInfo {
  en: string;
  es: string;
  textEn: string;
  textEs: string;
  /** Detailed mechanical description (English only). */
  detail?: string;
}

export interface PokedexEntry {
  id: number;
  speciesId: number;
  slug: string;
  name: string;
  types: string[];
  stats: Record<StatName, number>;
  abilities: AbilityRef[];
  heightM: number;
  weightKg: number;
  generation: number | null;
  sprite: string | null;
  spriteShiny?: string | null;
  artwork: string | null;
  artworkShiny?: string | null;
  evolutionLine?: EvolutionStage[];
}

export type Pokedex = Record<string, PokedexEntry>;

export interface Encounter {
  region: string;
  regionName: string;
  locationId: string;
  locationName: string;
  rarity: Rarity;
  time: SpawnTime;
  method: SpawnMethod;
  level: { min: number; max: number } | null;
  evs: EvYield[];
}

export interface MapMarker {
  locationId: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  kind: "route" | "city" | "dungeon";
}

export interface RegionMapData {
  region: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  markers: MapMarker[];
}

export interface MoveInfo {
  en: string;
  es: string;
  type: string;
  class: "physical" | "special" | "status";
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

export interface Learnset {
  vg: string;
  level: [string, number][];
  machine: string[];
  egg: string[];
  tutor: string[];
}

export interface SearchIndex {
  pokemon: { slug: string; name: string; id: number; types: string[]; caught: boolean }[];
  locations: { id: string; name: string; region: string }[];
}
