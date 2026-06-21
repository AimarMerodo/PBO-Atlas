import { slugifyName } from "@core/utils/slug";
import type { SearchIndex } from "@core/models/types";

export interface SearchGroups {
  pokemon: SearchIndex["pokemon"];
  items: SearchIndex["items"];
  mounts: SearchIndex["mounts"];
  cosmetics: SearchIndex["cosmetics"];
  locations: SearchIndex["locations"];
  regions: SearchIndex["regions"];
  total: number;
}

const EMPTY: SearchGroups = { pokemon: [], items: [], mounts: [], cosmetics: [], locations: [], regions: [], total: 0 };

/** Filter the global search index across every entity type. Pure + shared by the
 *  hero search and the Ctrl+K dialog so both behave identically. */
export function searchAll(index: SearchIndex | null, query: string, limit = 8): SearchGroups {
  const q = query.trim().toLowerCase();
  if (!q || !index) return EMPTY;
  const hit = (s: string) => s.toLowerCase().includes(q);
  const pokemon = index.pokemon.filter((p) => hit(p.name) || String(p.id) === q).slice(0, limit);
  const items = index.items.filter((i) => hit(i.name)).slice(0, limit);
  const mounts = index.mounts.filter((m) => hit(m.name)).slice(0, limit);
  const cosmetics = index.cosmetics.filter((c) => hit(c.name)).slice(0, limit);
  const locations = index.locations.filter((l) => hit(l.name)).slice(0, limit);
  const regions = index.regions.filter((r) => hit(r.name)).slice(0, limit);
  const total = pokemon.length + items.length + mounts.length + cosmetics.length + locations.length + regions.length;
  return { pokemon, items, mounts, cosmetics, locations, regions, total };
}

/** Route for a search result, by type. mounts deep-link by slugified name. */
export const hrefFor = {
  pokemon: (slug: string) => `/pokedex/${slug}`,
  item: (slug: string) => `/items?item=${slug}`,
  mount: (name: string) => `/mounts?mount=${slugifyName(name)}`,
  cosmetic: (slug: string) => `/cosmetics?bundle=${slug}`,
  location: (region: string, id: string) => `/region/${region}/${id}`,
  region: (id: string) => `/region/${id}`,
};

/** First result's href across all groups, for the hero "press Enter" shortcut. */
export function firstHref(g: SearchGroups): string | null {
  if (g.pokemon[0]) return hrefFor.pokemon(g.pokemon[0].slug);
  if (g.items[0]) return hrefFor.item(g.items[0].slug);
  if (g.mounts[0]) return hrefFor.mount(g.mounts[0].name);
  if (g.cosmetics[0]) return hrefFor.cosmetic(g.cosmetics[0].slug);
  if (g.locations[0]) return hrefFor.location(g.locations[0].region, g.locations[0].id);
  if (g.regions[0]) return hrefFor.region(g.regions[0].id);
  return null;
}
