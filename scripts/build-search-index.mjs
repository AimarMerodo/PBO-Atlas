// Build src/data/search-index.json: a compact index for the client-side global
// search (pokemon, locations, items, mounts, cosmetics, regions).
// Usage: node scripts/build-search-index.mjs

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPAWNS_DIR = path.join(ROOT, "data", "spawns");
const OUT_FILE = path.join(ROOT, "data", "search-index.json");
const readData = async (file) => JSON.parse(await readFile(path.join(ROOT, "data", file), "utf8"));
const asArray = (raw, key) => (Array.isArray(raw) ? raw : (raw[key] ?? Object.values(raw)[0]));

const pokedex = await readData("pokedex.json");

const caughtSlugs = new Set();
const locations = [];
for (const file of await readdir(SPAWNS_DIR)) {
  if (!file.endsWith(".json")) continue;
  const data = JSON.parse(await readFile(path.join(SPAWNS_DIR, file), "utf8"));
  for (const loc of data.locations) {
    locations.push({ id: loc.id, name: loc.name, region: data.region });
    for (const s of loc.spawns) caughtSlugs.add(s.pokemon);
  }
}

const pokemon = Object.values(pokedex)
  .sort((a, b) => a.id - b.id)
  .map((p) => ({
    slug: p.slug,
    name: p.name,
    id: p.id,
    types: p.types,
    sprite: p.spritePbo ?? p.sprite ?? null,
    caught: caughtSlugs.has(p.slug),
  }));

// Localized names (es/pt/zh) so search matches a term in any language, not just EN.
const loc = (o) => ({ ...(o.es && { es: o.es }), ...(o.pt && { pt: o.pt }), ...(o.zh && { zh: o.zh }) });

const mountsArr = asArray(await readData("mounts.json"), "mounts");
const cosmeticsArr = asArray(await readData("cosmetics.json"), "cosmetics");
const mounts = mountsArr.map((m) => ({ name: m.name, ...loc(m), icon: m.icon ?? null }));
const cosmetics = cosmeticsArr.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon ?? null }));

// Mounts and cosmetic bundles are ALSO present in items.json; drop those exact
// name duplicates from the items index so each only shows in its own section
// (distinct items like "X Mount Chest" are not in those sets, so they stay).
const ownSection = new Set([...mountsArr, ...cosmeticsArr].map((e) => (e.name ?? "").trim().toLowerCase()));
const items = asArray(await readData("items.json"), "items")
  .filter((i) => !ownSection.has((i.name ?? "").trim().toLowerCase()))
  .map((i) => ({ slug: i.slug, name: i.name, ...loc(i), icon: i.icon ?? null }));
const regions = asArray(await readData("regions.json"), "regions").map((r) => ({ id: r.id, name: r.name }));

// Moves (learnable by any mon) + abilities (used by any non-event mon), matching
// the /moves and /abilities dexes so search results land on a real entry.
const movesData = await readData("moves.json");
const learnable = new Set();
for (const ls of Object.values(movesData.learnsets ?? {})) {
  for (const m of [...ls.level.map(([mv]) => mv), ...ls.machine, ...ls.egg, ...ls.tutor]) learnable.add(m);
}
const moves = [...learnable]
  .filter((s) => movesData.moves[s])
  .map((s) => ({ slug: s, name: movesData.moves[s].en, ...loc(movesData.moves[s]), type: movesData.moves[s].type }))
  .sort((a, b) => a.name.localeCompare(b.name));

const abilitiesData = await readData("abilities.json");
const usedAbilities = new Set();
for (const p of Object.values(pokedex)) {
  if (p.event) continue;
  for (const a of p.abilities ?? []) usedAbilities.add(a.slug);
}
const abilities = [...usedAbilities]
  .filter((s) => abilitiesData[s])
  .map((s) => ({ slug: s, name: abilitiesData[s].en, ...loc(abilitiesData[s]) }))
  .sort((a, b) => a.name.localeCompare(b.name));

await writeFile(OUT_FILE, JSON.stringify({ pokemon, locations, items, mounts, cosmetics, regions, moves, abilities }), "utf8");
console.log(
  `Wrote ${pokemon.length} pokemon, ${locations.length} locations, ${items.length} items, ` +
    `${mounts.length} mounts, ${cosmetics.length} cosmetics, ${regions.length} regions, ` +
    `${moves.length} moves, ${abilities.length} abilities -> ${path.relative(ROOT, OUT_FILE)}`,
);
