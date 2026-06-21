// Domain models shared across the app (mirror of the data pipeline output).

export type Rarity = "common" | "uncommon" | "rare" | "very-rare" | "ultra-rare" | "legendary" | string;
export type SpawnTime = "all" | "day" | "night";
export type SpawnMethod = "walking" | "surfing" | "fishing" | "headbutt" | "rock-smash" | "honey" | "digging" | string;
export type StatName = "hp" | "attack" | "defense" | "special-attack" | "special-defense" | "speed";

export interface EvYield {
  stat: StatName;
  amount: number;
}

export interface Spawn {
  pokemon: string;
  displayName: string;
  rarity: Rarity;
  time: SpawnTime;
  method: SpawnMethod;
  methodNote?: string;
  level: { min: number; max: number } | null;
  evs: EvYield[];
  spriteUrl: string | null;
}

export interface LocationPage {
  region: string;
  regionName: string;
  sourceUrl: string;
  id: string;
  name: string;
  spawns: Spawn[];
}

export interface RegionMeta {
  id: string;
  name: string;
  order: number;
  description: Record<string, string>;
}

export interface HomeRegionCard extends RegionMeta {
  locations: number;
  species: number;
}

export interface HomePayload {
  regions: HomeRegionCard[];
  stats: {
    pokemon: number;
    locations: number;
    items: number;
    mounts: number;
    cosmetics: number;
  };
}

export interface MapMarker {
  locationId: string;
  x: number;
  y: number;
  kind: "route" | "city" | "dungeon";
}

export interface RegionMapData {
  region: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  markers: MapMarker[];
}

export interface MarkerPreview {
  locationId: string;
  name: string;
  speciesCount: number;
  topSpawns: { slug: string; name: string; spriteUrl: string | null }[];
}

export interface LocationSummary {
  id: string;
  name: string;
  speciesCount: number;
}

export interface RegionPage {
  meta: RegionMeta;
  locations: { id: string; name: string; speciesCount: number }[];
  map: RegionMapData | null;
  previews: Record<string, MarkerPreview> | null;
}

export interface AbilityRef {
  slug: string;
  hidden: boolean;
}

export interface AbilityInfo extends AbilityRef {
  en: string;
  es: string;
  zh?: string | null;
  textEn: string;
  textEs: string;
  detail?: string;
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
  spritePbo?: string | null;
  spritePboShiny?: string | null;
  /** Showdown animated-sprite id (dashed for forms, e.g. "charizard-megax"). */
  aniId?: string | null;
  evYield?: EvYield[] | null;
  flavor?: string | null;
  flavorEs?: string | null;
  flavorZh?: string | null;
}

export interface EvoStage {
  slug: string;
  name: string;
  trigger?: string;
  id: number | null;
  artwork: string | null;
  types: string[];
}

export interface Encounter {
  region: string;
  regionName: string;
  locationId: string;
  locationName: string;
  rarity: Rarity;
  time: SpawnTime;
  method: SpawnMethod;
  level: { min: number; max: number } | null;
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
  tm?: string | null;
}

export interface Learnset {
  vg: string;
  level: [string, number][];
  machine: string[];
  egg: string[];
  tutor: string[];
}

/** A non-wild way to obtain a pokemon (shop, event, ranked reward, craft...). */
export type ObtainMethod =
  | "store"
  | "event"
  | "ranked"
  | "craft"
  | "mining"
  | "boss"
  | "quest"
  | "roaming"
  | "evolution";

export interface Acquisition {
  method: ObtainMethod | string;
  /** Short "where" label, e.g. "Goodwill Token Shop" or "Top 10 monthly OU Ranked". */
  source: string;
  /** Optional cost / condition, e.g. "1,000 Goodwill Tokens" or "April–June". */
  detail?: string;
}

/** A Mega Evolution, Primal Reversion or Gigantamax form — a real dex entry,
 *  linked from its base/sibling pages. */
export interface PokemonForm {
  kind: "mega" | "primal" | "gmax";
  slug: string;
  name: string;
  types: string[];
  artwork: string | null;
}

export interface PokemonPage {
  entry: PokedexEntry;
  abilities: AbilityInfo[];
  evoStages: EvoStage[];
  encounters: Encounter[];
  catchableAncestors: { slug: string; name: string }[];
  obtain: Acquisition[];
  /** Items this pokemon drops when caught/fainted (full items, modal-ready). */
  drops: GameItem[];
  /** Mega/Primal/Gigantamax forms (empty if none). */
  forms: PokemonForm[];
  learnset: Learnset | null;
  moves: Record<string, MoveInfo> | null;
}

export interface PokedexCard {
  slug: string;
  name: string;
  id: number;
  types: string[];
  artwork: string | null;
  sprite: string | null;
  generation: number | null;
  bst: number;
  regions: string[];
  rarities: string[];
  evs: string[];
}

export interface SearchIndex {
  pokemon: { slug: string; name: string; id: number; types: string[]; sprite: string | null; caught: boolean }[];
  locations: { id: string; name: string; region: string }[];
  items: { slug: string; name: string; icon: AtlasIcon | null }[];
  mounts: { name: string; icon: AtlasIcon | null }[];
  cosmetics: { slug: string; name: string; icon: AtlasIcon | null }[];
  regions: { id: string; name: string }[];
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

/** A way to obtain an item: a wild drop from a pokemon, or a shop purchase. */
export interface ItemSource {
  method: "drop" | "shop" | string;
  /** Drop: the pokemon slug + display name that drops it (links to its page). */
  pokemon?: string;
  pokemonName?: string;
  /** Drop: regions where that pokemon (and so the drop) is available. */
  regions?: string[];
  /** Shop: the shop name. */
  source?: string;
  /** Shop price, or a precise drop location. */
  detail?: string;
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
  descEs: string | null;
  descPt: string | null;
  descZh: string | null;
  icon: AtlasIcon | null;
  teaches?: { name: string; es: string | null; zh: string | null; pt: string | null; type: string | null } | null;
  evolves?: { slug: string; name: string }[] | null;
  sources?: ItemSource[] | null;
}

export interface Mount {
  name: string;
  es: string | null;
  pt: string | null;
  zh: string | null;
  type: string;
  icon: AtlasIcon | null;
}

export interface CosmeticBundle {
  slug: string;
  name: string;
  icon: AtlasIcon | null;
  items: { name: string; es: string | null; pt: string | null; zh: string | null; icon: AtlasIcon | null }[];
}

export interface RoutesManifest {
  pokemon: string[];
  locations: string[];
  regions: string[];
}
