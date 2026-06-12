// Build src/data/search-index.json: a compact index for the client-side
// global search dialog (pokemon + locations).
// Usage: node scripts/build-search-index.mjs

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPAWNS_DIR = path.join(ROOT, "src", "data", "spawns");
const POKEDEX_FILE = path.join(ROOT, "src", "data", "pokedex.json");
const OUT_FILE = path.join(ROOT, "src", "data", "search-index.json");

const pokedex = JSON.parse(await readFile(POKEDEX_FILE, "utf8"));

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

await writeFile(OUT_FILE, JSON.stringify({ pokemon, locations }), "utf8");
console.log(`Wrote ${pokemon.length} pokemon + ${locations.length} locations -> ${path.relative(ROOT, OUT_FILE)}`);
