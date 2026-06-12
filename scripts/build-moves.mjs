// Build src/data/moves.json: learnsets per pokemon (level / machine / egg /
// tutor) from PokeAPI, preferring the Scarlet/Violet version group (PBO uses
// Gen 9 mechanics) with fallback to the latest group the pokemon appears in.
//
// The per-pokemon move lists are parsed from the already-cached pokemon
// payloads; only unique move details (type, power...) hit the network.
//
// Usage: node scripts/build-moves.mjs

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchText } from "./lib/http.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const POKEDEX_FILE = path.join(ROOT, "src", "data", "pokedex.json");
const OUT_FILE = path.join(ROOT, "src", "data", "moves.json");
const API = "https://pokeapi.co/api/v2";

// Newest first; the first group with any level-up data wins.
const VERSION_GROUPS = [
  "scarlet-violet",
  "legends-arceus",
  "brilliant-diamond-and-shining-pearl",
  "sword-shield",
  "ultra-sun-ultra-moon",
  "sun-moon",
  "omega-ruby-alpha-sapphire",
  "x-y",
];

async function fetchJson(url) {
  return JSON.parse(await fetchText(url, { subdir: "pokeapi", delayMs: 300 }));
}

async function fetchPokemon(slug) {
  try {
    return await fetchJson(`${API}/pokemon/${slug}`);
  } catch (err) {
    if (err.status !== 404) throw err;
    const sp = await fetchJson(`${API}/pokemon-species/${slug}`);
    const variety = sp.varieties.find((v) => v.is_default) ?? sp.varieties[0];
    return await fetchJson(variety.pokemon.url);
  }
}

/** Extract { vg, level: [[slug, lvl]...], machine: [], egg: [], tutor: [] } */
function extractLearnset(pokemon) {
  for (const vg of VERSION_GROUPS) {
    const buckets = { level: [], machine: [], egg: [], tutor: [] };
    let any = false;
    for (const m of pokemon.moves) {
      for (const d of m.version_group_details) {
        if (d.version_group.name !== vg) continue;
        any = true;
        const method = d.move_learn_method.name;
        if (method === "level-up") buckets.level.push([m.move.name, d.level_learned_at]);
        else if (method === "machine") buckets.machine.push(m.move.name);
        else if (method === "egg") buckets.egg.push(m.move.name);
        else if (method === "tutor") buckets.tutor.push(m.move.name);
      }
    }
    if (any && buckets.level.length) {
      buckets.level.sort((a, b) => a[1] - b[1]);
      for (const k of ["machine", "egg", "tutor"]) buckets[k] = [...new Set(buckets[k])].sort();
      // Dedupe level moves keeping the lowest level occurrence.
      const seen = new Set();
      buckets.level = buckets.level.filter(([slug]) => !seen.has(slug) && seen.add(slug));
      return { vg, ...buckets };
    }
  }
  return null;
}

const pokedex = JSON.parse(await readFile(POKEDEX_FILE, "utf8"));
const slugs = Object.keys(pokedex);
console.log(`${slugs.length} pokedex entries`);

const learnsets = {};
const moveSlugs = new Set();
let done = 0;
for (const slug of slugs) {
  try {
    const pokemon = await fetchPokemon(slug);
    const ls = extractLearnset(pokemon);
    if (ls) {
      learnsets[slug] = ls;
      for (const [s] of ls.level) moveSlugs.add(s);
      for (const k of ["machine", "egg", "tutor"]) for (const s of ls[k]) moveSlugs.add(s);
    }
  } catch (err) {
    console.warn(`learnset failed for ${slug}: ${err.message}`);
  }
  if (++done % 100 === 0) process.stdout.write(`\r${done}/${slugs.length} learnsets   `);
}
console.log(`\n${Object.keys(learnsets).length} learnsets, ${moveSlugs.size} unique moves`);

const moves = {};
done = 0;
for (const slug of moveSlugs) {
  try {
    const m = await fetchJson(`${API}/move/${slug}`);
    const localized = (lang) => m.names.find((n) => n.language.name === lang)?.name;
    moves[slug] = {
      en: localized("en") ?? slug,
      es: localized("es") ?? localized("en") ?? slug,
      zh: localized("zh-hans") ?? null,
      type: m.type.name,
      class: m.damage_class?.name ?? "status",
      power: m.power,
      accuracy: m.accuracy,
      pp: m.pp,
    };
  } catch (err) {
    console.warn(`move failed: ${slug}: ${err.message}`);
  }
  if (++done % 100 === 0) process.stdout.write(`\r${done}/${moveSlugs.size} moves   `);
}

await writeFile(OUT_FILE, JSON.stringify({ moves, learnsets }), "utf8");
const mb = (Buffer.byteLength(JSON.stringify({ moves, learnsets })) / 1024 / 1024).toFixed(1);
console.log(`\nWrote ${Object.keys(moves).length} moves + ${Object.keys(learnsets).length} learnsets (${mb} MB) -> ${path.relative(ROOT, OUT_FILE)}`);
