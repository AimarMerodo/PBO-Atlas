// Build data/item-sources.json — "where to get" data for notable items.
// Sourced by hand from the official PBO forum guide threads:
//   #1744 "Wild drops and where to find them" (item drops by pokemon + region)
//   #1760 "Items & Shops Overview"            (shop inventories)
// Output: data/item-sources.json  { "<itemSlug>": [{ method, ... }] }
// Usage: node scripts/build-item-sources.mjs

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pokemonSlug } from "./lib/normalize.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (...p) => JSON.parse(await readFile(path.join(ROOT, "data", ...p), "utf8"));

// item slug, pokemon display name, regions[], optional precise location.
// d() keeps the rows compact and readable.
const d = (item, pokemon, regions, detail) => ({ item, pokemon, regions, detail });

const DROPS = [
  // Held items
  d("black-belt", "Sawk", ["Hoenn"]),
  d("black-belt", "Meditite", ["Sinnoh", "Jvaloh"]),
  d("charcoal", "Vulpix", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("charcoal", "Torkoal", ["Sinnoh", "Hoenn"]),
  d("dragon-fang", "Gible", ["Sinnoh"]),
  d("expert-belt", "Pinsir", ["Sinnoh"]),
  d("hard-stone", "Onix", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("magnet", "Magnemite", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("miracle-seed", "Fomantis", ["Jvaloh"]),
  d("mystic-water", "Frillish", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("mystic-water", "Pelipper", ["Hoenn"]),
  d("never-melt-ice", "Cryogonal", ["Jvaloh", "Hoenn"]),
  d("never-melt-ice", "Jynx", ["Sinnoh"]),
  d("poison-barb", "Qwilfish", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("poison-barb", "Skorupi", ["Sinnoh"]),
  d("sharp-beak", "Starly", ["Sinnoh"]),
  d("silk-scarf", "Lickitung", ["Hoenn"]),
  d("silk-scarf", "Kangaskhan", ["Jvaloh"]),
  d("silver-powder", "Dustox", ["Sinnoh"]),
  d("soft-sand", "Diglett", ["Jvaloh", "Hoenn"]),
  d("soft-sand", "Sandslash", ["Sinnoh"]),
  d("spell-tag", "Misdreavus", ["Sinnoh"]),
  d("twisted-spoon", "Abra", ["Jvaloh"]),
  d("twisted-spoon", "Kadabra", ["Sinnoh"]),
  d("black-glasses", "Sandile", ["Sinnoh"]),
  d("leek", "Farfetch'd-Galar", ["Jvaloh"]),
  // Evolution items
  d("electirizer", "Elekid", ["Sinnoh"]),
  d("magmarizer", "Magby", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("razor-fang", "Gligar", ["Sinnoh"]),
  d("auspicious-armor", "Charcadet", ["Hoenn"]),
  d("malicious-armor", "Charcadet", ["Hoenn"]),
  d("kings-rock", "Politoed", ["Hoenn"]),
  d("kings-rock", "Slowpoke", ["Sinnoh"]),
  d("galarica-cuff", "Slowpoke-Galar", ["Hoenn"]),
  d("galarica-wreath", "Slowpoke-Galar", ["Hoenn"]),
  d("prism-scale", "Feebas", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("razor-claw", "Sneasel", ["Sinnoh", "Jvaloh"]),
  d("reaper-cloth", "Duskull", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("deepseatooth", "Clamperl", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("deepseascale", "Clamperl", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("protector", "Rhyhorn", ["Sinnoh"]),
  d("metal-coat", "Scyther", ["Sinnoh"]),
  d("metal-coat", "Onix", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("metal-coat", "Beldum", ["Hoenn"]),
  d("dragon-scale", "Horsea", ["Sinnoh", "Hoenn"]),
  d("oval-stone", "Chansey", ["Sinnoh"]),
  d("oval-stone", "Happiny", ["Jvaloh"]),
  // Evolution stones
  d("moon-stone", "Clefairy", ["Sinnoh"]),
  d("dawn-stone", "Kirlia", ["Sinnoh", "Jvaloh"]),
  d("water-stone", "Staryu", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("fire-stone", "Vulpix", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("sun-stone", "Helioptile", ["Sinnoh"]),
  d("dusk-stone", "Murkrow", ["Sinnoh"]),
  d("thunder-stone", "Magnemite", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("thunder-stone", "Pichu", ["Sinnoh"]),
  d("leaf-stone", "Seedot", ["Sinnoh", "Hoenn"]),
  d("leaf-stone", "Gloom", ["Hoenn"]),
  d("shiny-stone", "Roselia", ["Sinnoh"]),
  // Mega stones
  d("mawilite", "Mawile", ["Hoenn"]),
  d("aggronite", "Aron", ["Hoenn"]),
  d("manectite", "Electrike", ["Sinnoh"]),
  d("garchompite", "Gible", ["Sinnoh"], "Wayward Cave 2F"),
  d("sharpedonite", "Carvanha", ["Sinnoh"], "Route 222"),
  d("metagrossite-essence", "Relicanth", ["Hoenn"], "Route 126"),
  d("metagrossite-crest", "Tatsugiri", ["Hoenn"], "Meteor Falls"),
  // Misc
  d("heart-scale", "Luvdisc", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("stardust", "Staryu", ["Hoenn"]),
  d("star-piece", "Staryu", ["Hoenn"]),
];

// Shop inventories (notable items only — TMs, mounts, cosmetics & event
// chests are intentionally skipped). [itemSlug, price] per shop + unit.
const fmt = (n) => n.toLocaleString("en-US");
const shop = (source, unit, rows) => rows.map(([item, price]) => ({ item, source, detail: `${fmt(price)} ${unit}` }));
const SHOPS = [
  // Dynite Ore Store — Global Terminal, Jubilife City (from Dynamax Invasion).
  ...shop("Dynite Ore Store", "Ores", [
    ["permanent-air-balloon", 300], ["metronome", 400], ["macho-brace", 500], ["exp-share", 400],
    ["light-clay", 300], ["terrain-extender", 200], ["ability-patch", 125], ["iv-randomizer", 75],
    ["ability-capsule", 60], ["grassy-seed", 200], ["electric-seed", 200], ["psychic-seed", 200],
    ["misty-seed", 200], ["charizardite-x", 3000], ["red-card", 300], ["eject-pack", 300], ["shell-bell", 40],
  ]),
  // Crew Wars Token Shop — Hearthome City (Sinnoh) / Rockshore City (Jvaloh).
  ...shop("Crew Wars Token Shop", "Tokens", [
    ["medichamite", 2500], ["life-orb", 800], ["assault-vest", 800], ["leftovers", 800], ["eviolite", 800],
    ["rocky-helmet", 600], ["wise-glasses", 200], ["muscle-band", 200],
    ["damp-rock", 300], ["icy-rock", 300], ["heat-rock", 300], ["smooth-rock", 300],
  ]),
  // Blaze Coin Shop — Global Terminal, Jubilife City (from wild faints & PvE).
  ...shop("Blaze Coin Shop", "Coins", [
    ["choice-scarf", 150], ["choice-band", 150], ["choice-specs", 150], ["light-ball", 50],
    ["exp-share", 65], ["iv-randomizer", 25],
    ["fire-stone", 15], ["water-stone", 15], ["thunder-stone", 15], ["leaf-stone", 15], ["shiny-stone", 15],
    ["dusk-stone", 15], ["dawn-stone", 15], ["ice-stone", 15], ["moon-stone", 15], ["sun-stone", 15],
  ]),
  // Mega stone token shops.
  { item: "gardevoirite", source: "Battle Token Shop", detail: "2,000 Battle Tokens" },
  { item: "absolite", source: "PvP Store", detail: "2,500 Ranked Tokens" },
  { item: "tyranitarite", source: "Casino Token Store", detail: "45,000 Casino Tokens" },
];

const items = (await readJson("items.json")).items;
const pokedex = await readJson("pokedex.json");
const itemSlugs = new Set(items.map((i) => i.slug));

const out = {};
const warnings = [];
const push = (slug, entry) => {
  (out[slug] ??= []).push(entry);
};

for (const row of DROPS) {
  if (!itemSlugs.has(row.item)) {
    warnings.push(`drop: unknown item slug "${row.item}"`);
    continue;
  }
  const pslug = pokemonSlug(row.pokemon);
  if (!pokedex[pslug]) {
    warnings.push(`drop: unknown pokemon "${row.pokemon}" (→ ${pslug}) for ${row.item}`);
    continue;
  }
  push(row.item, { method: "drop", pokemon: pslug, pokemonName: row.pokemon, regions: row.regions, ...(row.detail ? { detail: row.detail } : {}) });
}

for (const row of SHOPS) {
  if (!itemSlugs.has(row.item)) {
    warnings.push(`shop: unknown item slug "${row.item}"`);
    continue;
  }
  push(row.item, { method: "shop", source: row.source, detail: row.detail });
}

// Bulk NPC-shop sources from the in-game Item Finder capture (data/item-finder.json).
// Adds shop rows ONLY for items that don't already have a curated shop source above —
// existing drop/shop rows are never modified. Items are matched by display name → slug.
const norm = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slugByName = new Map();
for (const i of items) if (!slugByName.has(norm(i.name))) slugByName.set(norm(i.name), i.slug);

let finder = null;
try {
  finder = JSON.parse(await readFile(path.join(ROOT, "data", "item-finder.json"), "utf8"));
} catch {
  warnings.push("item-finder.json not found — skipping bulk shop import");
}
let finderAdded = 0;
let finderUnmatched = 0;
for (const it of finder?.items ?? []) {
  const slug = slugByName.get(norm(it.nombre));
  if (!slug) {
    finderUnmatched++;
    continue;
  }
  // Don't modify items that already have a curated shop source.
  if ((out[slug] ?? []).some((r) => r.method === "shop")) continue;
  const seen = new Set();
  for (const o of it.opciones_compra ?? []) {
    if (!o.tienda) continue;
    const detail = [o.cantidad, o.moneda].filter((x) => x !== null && x !== undefined && x !== "").join(" ");
    const key = `${o.tienda}|${detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    push(slug, { method: "shop", source: o.tienda, detail });
    finderAdded++;
  }
}

const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
const payload = {
  _meta: {
    note: "Where to get items. Hand-sourced drops + shops from the official PBO forum (#1744, #1760), plus NPC-shop rows auto-added from the in-game Item Finder capture (data/item-finder.json) for items lacking a curated shop. method ∈ drop|shop.",
    sources: [
      "https://forums.pokemonblazeonline.com/threads/wild-drops-and-where-to-find-them-wip.1744/",
      "https://forums.pokemonblazeonline.com/threads/items-shops-overview-wip.1760/",
    ],
  },
  sources: sorted,
};

await writeFile(path.join(ROOT, "data", "item-sources.json"), JSON.stringify(payload, null, 2), "utf8");

const dropCount = Object.values(sorted).reduce((n, a) => n + a.length, 0);
console.log(`item-sources.json: ${Object.keys(sorted).length} items, ${dropCount} source rows`);
console.log(`  finder: +${finderAdded} shop rows for ${finderAdded ? "newly-covered" : "0"} items, ${finderUnmatched} finder items unmatched (e.g. Gen9 TMs)`);
if (warnings.length) {
  console.warn(`${warnings.length} warning(s):`);
  for (const w of warnings) console.warn("  ⚠ " + w);
}
