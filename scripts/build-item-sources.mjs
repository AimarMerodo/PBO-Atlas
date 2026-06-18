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

// item slug, shop name, price/detail. (Dynite Ore Store, Jubilife City.)
const s = (item, source, detail) => ({ item, source, detail });
const SHOPS = [
  s("ability-patch", "Dynite Ore Store", "125 Ores"),
  s("ability-capsule", "Dynite Ore Store", "60 Ores"),
  s("macho-brace", "Dynite Ore Store", "500 Ores"),
  s("exp-share", "Dynite Ore Store", "400 Ores"),
  s("light-clay", "Dynite Ore Store", "300 Ores"),
  s("metronome", "Dynite Ore Store", "400 Ores"),
  s("terrain-extender", "Dynite Ore Store", "200 Ores"),
  s("iv-randomizer", "Dynite Ore Store", "75 Ores"),
  s("red-card", "Dynite Ore Store", "300 Ores"),
  s("eject-pack", "Dynite Ore Store", "300 Ores"),
  s("shell-bell", "Dynite Ore Store", "40 Ores"),
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

const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
const payload = {
  _meta: {
    note: "Where to get notable items. Sourced by hand from the official PBO forum (drops thread #1744, shops thread #1760). method ∈ drop|shop.",
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
if (warnings.length) {
  console.warn(`${warnings.length} warning(s):`);
  for (const w of warnings) console.warn("  ⚠ " + w);
}
