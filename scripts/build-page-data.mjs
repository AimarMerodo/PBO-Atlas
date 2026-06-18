// Split the big data JSONs into small per-entity files for the Angular app
// (each page fetches only what it needs, ~5-30 KB).
// Output: public/data/{pokemon,locations,regions,lists}/...
// Usage: node scripts/build-page-data.mjs

import { mkdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "data");
const OUT = path.join(ROOT, "public", "data");

const readJson = async (...p) => JSON.parse(await readFile(path.join(SRC, ...p), "utf8"));
const write = async (rel, data) => {
  const file = path.join(OUT, ...rel.split("/"));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data), "utf8");
};

await rm(OUT, { recursive: true, force: true });

const regions = (await readJson("regions.json")).sort((a, b) => a.order - b.order);
const pokedex = await readJson("pokedex.json");
const abilities = await readJson("abilities.json");
const movesData = await readJson("moves.json");
const natures = await readJson("natures.json");
const searchIndex = await readJson("search-index.json");
const acquisitions = (await readJson("acquisitions.json")).acquisitions ?? {};
const itemSources = (await readJson("item-sources.json")).sources ?? {};

const spawnsByRegion = {};
for (const r of regions) spawnsByRegion[r.id] = await readJson("spawns", `${r.id}.json`);

const maps = {};
for (const r of regions) {
  try {
    maps[r.id] = await readJson("maps", `${r.id}.json`);
  } catch {
    maps[r.id] = null;
  }
}

// --- Encounter reverse index (mirror of src/lib/data.ts) ---
const encounters = new Map();
for (const r of regions) {
  for (const loc of spawnsByRegion[r.id].locations) {
    for (const s of loc.spawns) {
      const list = encounters.get(s.pokemon) ?? [];
      list.push({
        region: r.id,
        regionName: r.name,
        locationId: loc.id,
        locationName: loc.name,
        rarity: s.rarity,
        time: s.time,
        method: s.method,
        level: s.level,
      });
      encounters.set(s.pokemon, list);
    }
  }
}

// --- pokemon/<slug>.json ---
for (const [slug, entry] of Object.entries(pokedex)) {
  const learnset = movesData.learnsets[slug] ?? null;
  let moves = null;
  if (learnset) {
    moves = {};
    const add = (s) => {
      if (movesData.moves[s]) moves[s] = movesData.moves[s];
    };
    learnset.level.forEach(([s]) => add(s));
    ["machine", "egg", "tutor"].forEach((k) => learnset[k].forEach(add));
  }
  const evoStages = (entry.evolutionLine ?? []).map((m) => {
    const e = pokedex[m.slug];
    return { slug: m.slug, name: m.name, trigger: m.trigger, id: e?.id ?? null, artwork: e?.artwork ?? null, types: e?.types ?? [] };
  });
  const catchableAncestors =
    (encounters.get(slug)?.length ?? 0) === 0
      ? evoStages.filter((m) => m.slug !== slug && (encounters.get(m.slug)?.length ?? 0) > 0).map(({ slug: s, name }) => ({ slug: s, name }))
      : [];
  await write(`pokemon/${slug}.json`, {
    entry: { ...entry, evolutionLine: undefined },
    abilities: entry.abilities.map((a) => ({ ...a, ...(abilities[a.slug] ?? {}) })),
    evoStages,
    encounters: encounters.get(slug) ?? [],
    catchableAncestors,
    obtain: acquisitions[slug] ?? [],
    learnset,
    moves,
  });
}
const badAcq = Object.keys(acquisitions).filter((s) => !pokedex[s]);
if (badAcq.length) console.warn(`  ⚠ acquisitions.json has ${badAcq.length} unknown slug(s): ${badAcq.join(", ")}`);
console.log(`pokemon: ${Object.keys(pokedex).length} files (${Object.keys(acquisitions).length} with obtain methods)`);

// --- locations/<region>/<id>.json + regions/<region>.json ---
for (const r of regions) {
  const data = spawnsByRegion[r.id];
  for (const loc of data.locations) {
    await write(`locations/${r.id}/${loc.id}.json`, {
      region: r.id,
      regionName: r.name,
      sourceUrl: data.sourceUrl,
      id: loc.id,
      name: loc.name,
      spawns: loc.spawns.map((s) => ({
        ...s,
        raw: undefined,
        spriteUrl: pokedex[s.pokemon]?.spritePbo ?? pokedex[s.pokemon]?.sprite ?? null,
      })),
    });
  }
  const previews = Object.fromEntries(
    data.locations.map((l) => [
      l.id,
      {
        locationId: l.id,
        name: l.name,
        speciesCount: new Set(l.spawns.map((s) => s.pokemon)).size,
        topSpawns: l.spawns.slice(0, 3).map((s) => ({
          slug: s.pokemon,
          name: s.displayName,
          spriteUrl: pokedex[s.pokemon]?.spritePbo ?? pokedex[s.pokemon]?.sprite ?? null,
        })),
      },
    ])
  );
  await write(`regions/${r.id}.json`, {
    meta: r,
    locations: data.locations.map((l) => ({
      id: l.id,
      name: l.name,
      speciesCount: new Set(l.spawns.map((s) => s.pokemon)).size,
    })),
    map: maps[r.id],
    previews: maps[r.id] ? previews : null,
  });
}
console.log(`locations: ${regions.reduce((n, r) => n + spawnsByRegion[r.id].locations.length, 0)} files + 4 region files`);

// --- lists ---
const homeRegions = regions.map((r) => {
  const species = new Set();
  spawnsByRegion[r.id].locations.forEach((l) => l.spawns.forEach((s) => species.add(s.pokemon)));
  return { ...r, locations: spawnsByRegion[r.id].locations.length, species: species.size };
});
await write("lists/home.json", {
  regions: homeRegions,
  stats: {
    pokemon: Object.keys(pokedex).length,
    locations: homeRegions.reduce((n, r) => n + r.locations, 0),
    items: (await readJson("items.json")).items.length,
    mounts: (await readJson("mounts.json")).length,
    cosmetics: (await readJson("cosmetics.json")).length,
    natures: natures.length,
  },
});
await write(
  "lists/pokedex.json",
  Object.values(pokedex)
    .sort((a, b) => a.id - b.id)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      id: p.id,
      types: p.types,
      artwork: p.artwork,
      sprite: p.spritePbo ?? p.sprite,
      generation: p.generation,
      bst: Object.values(p.stats).reduce((x, y) => x + y, 0),
      regions: [...new Set((encounters.get(p.slug) ?? []).map((e) => e.region))],
      rarities: [...new Set((encounters.get(p.slug) ?? []).map((e) => e.rarity))],
      evs: (p.evYield ?? []).map((ev) => ev.stat),
    }))
);
await write("lists/search.json", searchIndex);
await write("lists/natures.json", natures);

// Items: merge in "where to get" sources for the notable ones.
const itemsData = await readJson("items.json");
let itemsWithSources = 0;
await write("lists/items.json", {
  items: itemsData.items.map((it) => {
    const src = itemSources[it.slug];
    if (!src) return it;
    itemsWithSources++;
    return { ...it, sources: src };
  }),
});

// Lazy datasets reused as-is
for (const f of ["mounts.json", "cosmetics.json"]) {
  await copyFile(path.join(SRC, f), path.join(OUT, "lists", f.replace(".json", "") + ".json")).catch(async () => {
    await mkdir(path.join(OUT, "lists"), { recursive: true });
    await copyFile(path.join(SRC, f), path.join(OUT, "lists", f));
  });
}
console.log(`lists: home, pokedex, search, natures, items (${itemsWithSources} with sources), mounts, cosmetics`);

// Slug manifests for prerendering
await write("lists/routes.json", {
  pokemon: Object.keys(pokedex),
  locations: regions.flatMap((r) => spawnsByRegion[r.id].locations.map((l) => `${r.id}/${l.id}`)),
  regions: regions.map((r) => r.id),
});
console.log("routes manifest written");
