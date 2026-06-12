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
  /** Simplified Chinese name (official, when available). */
  zh?: string | null;
  textEn: string;
  textEs: string;
  /** Detailed mechanical description (English). */
  detail?: string;
  /** Translations of the detailed description. */
  detailEs?: string | null;
  detailZh?: string | null;
  detailPt?: string | null;
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
  /** In-game PBO sprites (extracted from the client, used with permission). */
  spritePbo?: string | null;
  spritePboShiny?: string | null;
  /** Official in-game EV yield. */
  evYield?: EvYield[] | null;
  /** Pokedex flavor text (English). */
  flavor?: string | null;
  evolutionLine?: EvolutionStage[];
}

export interface Nature {
  name: string;
  es: string;
  pt: string;
  zh: string;
  up: StatName | null;
  down: StatName | null;
}

export interface AtlasIcon {
  page: string;
  x: number;
  y: number;
  w: number;
  h: number;
  pageW: number;
  pageH: number;
}

export interface GameItem {
  id: number;
  slug: string;
  name: string;
  es: string | null;
  pt: string | null;
  zh: string | null;
  category: string;
  description: string;
  icon: AtlasIcon | null;
}

export interface Mount {
  name: string;
  type: string;
  icon: AtlasIcon | null;
}

export interface CosmeticBundle {
  slug: string;
  name: string;
  items: string[];
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
  zh?: string | null;
  pt?: string | null;
  descEn?: string;
  descEs?: string | null;
  descZh?: string | null;
  type: string;
  class: "physical" | "special" | "status";
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  /** In-game machine code like "TM27" or "HM02". */
  tm?: string | null;
}

export interface Learnset {
  vg: string;
  level: [string, number][];
  machine: string[];
  egg: string[];
  tutor: string[];
}

export interface SearchIndex {
  pokemon: { slug: string; name: string; id: number; types: string[]; sprite: string | null; caught: boolean }[];
  locations: { id: string; name: string; region: string }[];
}
