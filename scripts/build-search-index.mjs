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

const items = asArray(await readData("items.json"), "items").map((i) => ({ slug: i.slug, name: i.name, icon: i.icon ?? null }));
const mounts = asArray(await readData("mounts.json"), "mounts").map((m) => ({ name: m.name, icon: m.icon ?? null }));
const cosmetics = asArray(await readData("cosmetics.json"), "cosmetics").map((c) => ({ slug: c.slug, name: c.name, icon: c.icon ?? null }));
const regions = asArray(await readData("regions.json"), "regions").map((r) => ({ id: r.id, name: r.name }));

await writeFile(OUT_FILE, JSON.stringify({ pokemon, locations, items, mounts, cosmetics, regions }), "utf8");
console.log(
  `Wrote ${pokemon.length} pokemon, ${locations.length} locations, ${items.length} items, ` +
    `${mounts.length} mounts, ${cosmetics.length} cosmetics, ${regions.length} regions -> ${path.relative(ROOT, OUT_FILE)}`,
);
