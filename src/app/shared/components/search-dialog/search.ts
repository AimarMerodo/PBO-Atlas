import { slugifyName } from "@core/utils/slug";
import type { SearchIndex } from "@core/models/types";

export interface SearchGroups {
  pokemon: SearchIndex["pokemon"];
  moves: SearchIndex["moves"];
  abilities: SearchIndex["abilities"];
  items: SearchIndex["items"];
  mounts: SearchIndex["mounts"];
  cosmetics: SearchIndex["cosmetics"];
  locations: SearchIndex["locations"];
  regions: SearchIndex["regions"];
  total: number;
}

const EMPTY: SearchGroups = { pokemon: [], moves: [], abilities: [], items: [], mounts: [], cosmetics: [], locations: [], regions: [], total: 0 };

/** Filter the global search index across every entity type. Pure + shared by the
 *  hero search and the Ctrl+K dialog so both behave identically. */
export function searchAll(index: SearchIndex | null, query: string, limit = 8): SearchGroups {
  const q = query.trim().toLowerCase();
  if (!q || !index) return EMPTY;
  const hit = (s: string) => s.toLowerCase().includes(q);
  const pokemon = index.pokemon.filter((p) => hit(p.name) || String(p.id) === q).slice(0, limit);
  const moves = index.moves.filter((m) => hit(m.name)).slice(0, limit);
  const abilities = index.abilities.filter((a) => hit(a.name)).slice(0, limit);
  const items = index.items.filter((i) => hit(i.name)).slice(0, limit);
  const mounts = index.mounts.filter((m) => hit(m.name)).slice(0, limit);
  const cosmetics = index.cosmetics.filter((c) => hit(c.name)).slice(0, limit);
  const locations = index.locations.filter((l) => hit(l.name)).slice(0, limit);
  const regions = index.regions.filter((r) => hit(r.name)).slice(0, limit);
  const total =
    pokemon.length + moves.length + abilities.length + items.length + mounts.length + cosmetics.length + locations.length + regions.length;
  return { pokemon, moves, abilities, items, mounts, cosmetics, locations, regions, total };
}

/** Route for a search result, by type. mounts deep-link by slugified name. */
export const hrefFor = {
  pokemon: (slug: string) => `/pokedex/${slug}`,
  move: (slug: string) => `/moves?move=${slug}`,
  ability: (slug: string) => `/abilities?ability=${slug}`,
  item: (slug: string) => `/items?item=${slug}`,
  mount: (name: string) => `/mounts?mount=${slugifyName(name)}`,
  cosmetic: (slug: string) => `/cosmetics?bundle=${slug}`,
  location: (region: string, id: string) => `/region/${region}/${id}`,
  region: (id: string) => `/region/${id}`,
};

/** All result hrefs in render order — drives arrow-key navigation and the Enter shortcut. */
export function flatHrefs(g: SearchGroups): string[] {
  return [
    ...g.pokemon.map((p) => hrefFor.pokemon(p.slug)),
    ...g.moves.map((m) => hrefFor.move(m.slug)),
    ...g.abilities.map((a) => hrefFor.ability(a.slug)),
    ...g.items.map((i) => hrefFor.item(i.slug)),
    ...g.mounts.map((m) => hrefFor.mount(m.name)),
    ...g.cosmetics.map((c) => hrefFor.cosmetic(c.slug)),
    ...g.locations.map((l) => hrefFor.location(l.region, l.id)),
    ...g.regions.map((r) => hrefFor.region(r.id)),
  ];
}

/** First result's href across all groups, for the "press Enter" shortcut. */
export function firstHref(g: SearchGroups): string | null {
  return flatHrefs(g)[0] ?? null;
}
