// Build src/data/pokedex.json from PokeAPI for every species appearing in
// the scraped spawn files, plus their full evolution lines.
// Usage: node scripts/build-pokedex.mjs

import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchText } from "./lib/http.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPAWNS_DIR = path.join(ROOT, "src", "data", "spawns");
const OUT_FILE = path.join(ROOT, "src", "data", "pokedex.json");
const API = "https://pokeapi.co/api/v2";

async function fetchJson(url) {
  return JSON.parse(await fetchText(url, { subdir: "pokeapi", delayMs: 300 }));
}

function titleCase(slug) {
  return slug
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/** Flatten an evolution chain into ordered stages with trigger summaries. */
function flattenChain(chain) {
  const line = [];
  const walk = (node, trigger) => {
    line.push({ slug: node.species.name, trigger });
    for (const next of node.evolves_to) {
      walk(next, describeEvolution(next.evolution_details[0]));
    }
  };
  walk(chain, undefined);
  return line;
}

function describeEvolution(d) {
  if (!d) return "special";
  const parts = [];
  if (d.min_level) parts.push(`level ${d.min_level}`);
  if (d.item) parts.push(`use ${titleCase(d.item.name)}`);
  if (d.held_item) parts.push(`hold ${titleCase(d.held_item.name)}`);
  if (d.min_happiness) parts.push("high friendship");
  if (d.time_of_day) parts.push(d.time_of_day);
  if (d.trigger?.name === "trade") parts.push("trade");
  if (d.known_move) parts.push(`knows ${titleCase(d.known_move.name)}`);
  if (d.location) parts.push(`at ${titleCase(d.location.name)}`);
  return parts.length ? parts.join(", ") : (d.trigger?.name ?? "special");
}

async function buildEntry(slug) {
  let pokemon;
  try {
    pokemon = await fetchJson(`${API}/pokemon/${slug}`);
  } catch (err) {
    if (err.status !== 404) throw err;
    // Species whose default variety has a form suffix (e.g. frillish ->
    // frillish-male, basculin -> basculin-red-striped): resolve via species.
    const sp = await fetchJson(`${API}/pokemon-species/${slug}`);
    const variety = sp.varieties.find((v) => v.is_default) ?? sp.varieties[0];
    pokemon = await fetchJson(variety.pokemon.url);
  }
  const species = await fetchJson(pokemon.species.url);

  const stats = {};
  for (const s of pokemon.stats) stats[s.stat.name] = s.base_stat;

  const genMatch = species.generation?.name?.match(/generation-(\w+)/);
  const ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9 };

  return {
    entry: {
      id: pokemon.id,
      speciesId: species.id,
      slug,
      name: titleCase(slug),
      types: pokemon.types.map((t) => t.type.name),
      stats,
      abilities: pokemon.abilities.map((a) => a.ability.name),
      heightM: pokemon.height / 10,
      weightKg: pokemon.weight / 10,
      generation: genMatch ? ROMAN[genMatch[1]] ?? null : null,
      sprite: pokemon.sprites.front_default,
      spriteShiny: pokemon.sprites.front_shiny ?? null,
      artwork: pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default,
      artworkShiny: pokemon.sprites.other?.["official-artwork"]?.front_shiny ?? pokemon.sprites.front_shiny ?? null,
      evolutionChainUrl: species.evolution_chain?.url ?? null,
    },
  };
}

// 1. Collect unique slugs from all spawn files.
const slugs = new Set();
for (const file of await readdir(SPAWNS_DIR)) {
  if (!file.endsWith(".json")) continue;
  const data = JSON.parse(await readFile(path.join(SPAWNS_DIR, file), "utf8"));
  for (const loc of data.locations) for (const s of loc.spawns) slugs.add(s.pokemon);
}
console.log(`${slugs.size} unique species in spawn data`);

// 1b. Add every national-dex species so the pokedex is complete even for
// pokemon without wild spawns (chests, events, trades, not yet in PBO).
const allSpecies = await fetchJson(`${API}/pokemon-species?limit=2000`);
for (const sp of allSpecies.results) slugs.add(sp.name);
console.log(`${slugs.size} total species incl. full national dex`);

// 1c. Add alternate forms (Mega, regional, Therian, Origin, Calyrex riders...)
// minus battle-/cosmetic-only noise.
const FORM_NOISE =
  /-(gmax|totem|eternamax|cosplay|starter|low-power-mode|drive-mode|aquatic-mode|glide-mode|limited-build|sprinting-build|swimming-build|gliding-build)\b/;
const allPokemon = await fetchJson(`${API}/pokemon?limit=3000`);
for (const p of allPokemon.results) {
  if (!FORM_NOISE.test(p.name)) slugs.add(p.name);
}
console.log(`${slugs.size} total incl. alternate forms`);

// 2. Fetch entries; queue grows as evolution-line members are discovered.
const pokedex = {};
const failures = [];
const queue = [...slugs];
const queued = new Set(queue);

while (queue.length) {
  const slug = queue.shift();
  try {
    const { entry } = await buildEntry(slug);
    pokedex[slug] = entry;
  } catch (err) {
    failures.push({ slug, error: err.message });
    continue;
  }
  process.stdout.write(`\r${Object.keys(pokedex).length} fetched, ${queue.length} queued   `);

  // Resolve evolution line; enqueue unseen members.
  const entry = pokedex[slug];
  if (entry.evolutionChainUrl) {
    try {
      const chain = await fetchJson(entry.evolutionChainUrl);
      entry.evolutionLine = flattenChain(chain.chain);
      for (const member of entry.evolutionLine) {
        if (!queued.has(member.slug)) {
          queued.add(member.slug);
          queue.push(member.slug);
        }
      }
    } catch (err) {
      failures.push({ slug: `${slug} (chain)`, error: err.message });
    }
  }
  delete entry.evolutionChainUrl;
}
console.log();

// 2b. Evolution lines PokeAPI doesn't connect (separate chains per species).
const CHAIN_OVERRIDES = {
  meltan: [{ slug: "meltan" }, { slug: "melmetal", trigger: "special" }],
};
for (const [slug, line] of Object.entries(CHAIN_OVERRIDES)) {
  for (const member of line) {
    if (pokedex[member.slug]) pokedex[member.slug].evolutionLine = line.map((m) => ({ ...m }));
  }
}

// 3. Decorate evolution lines with display names; mark catchable members.
for (const entry of Object.values(pokedex)) {
  if (!entry.evolutionLine) continue;
  entry.evolutionLine = entry.evolutionLine.map((m) => ({
    ...m,
    name: pokedex[m.slug]?.name ?? titleCase(m.slug),
  }));
}

await mkdir(path.dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, JSON.stringify(pokedex, null, 1), "utf8");
console.log(`Wrote ${Object.keys(pokedex).length} entries -> ${path.relative(ROOT, OUT_FILE)}`);

if (failures.length) {
  console.log(`\n${failures.length} FAILURES — add forum-name -> PokeAPI-slug mappings to scripts/lib/slug-overrides.mjs:`);
  for (const f of failures) console.log(`  - ${f.slug}: ${f.error}`);
  process.exitCode = 1;
}
