// Add Gigantamax forms to data/pokedex.json. build-pokedex.mjs deliberately
// excludes "-gmax" via its FORM_NOISE filter, but PBO ships the gmax sprites
// (public/sprites/pbo/front/*gmax.png), so they should be real dex entries like
// the Mega forms. This mirrors a Mega entry: PokeAPI form data (id, types,
// stats, abilities, artwork) + the PBO sprite + the base species' evolution line
// and localized flavor. Run: node scripts/build-gmax.mjs
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchText } from "./lib/http.mjs";
import { showdownCandidates } from "./lib/showdown-ids.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const POKEDEX = path.join(ROOT, "data", "pokedex.json");
const API = "https://pokeapi.co/api/v2";

const fetchJson = async (url) => JSON.parse(await fetchText(url, { subdir: "pokeapi", delayMs: 300 }));
const pboSprite = (slug, shiny) => {
  for (const cand of showdownCandidates(slug)) {
    const rel = `sprites/pbo/${shiny ? "front-shiny" : "front"}/${cand}.png`;
    if (existsSync(path.join(ROOT, "public", rel))) return `/${rel}`;
  }
  return null;
};

const pokedex = JSON.parse(await readFile(POKEDEX, "utf8"));

// National-dex base entry per speciesId (form entries have id >= 10000).
const baseBySpecies = new Map();
for (const e of Object.values(pokedex)) {
  if (e.id >= 10000) continue;
  const cur = baseBySpecies.get(e.speciesId);
  if (!cur || e.id === e.speciesId || e.id < cur.id) baseBySpecies.set(e.speciesId, e);
}

const list = await fetchJson(`${API}/pokemon?limit=3000`);
const gmaxSlugs = list.results.map((r) => r.name).filter((n) => /-gmax$/.test(n));
console.log(`${gmaxSlugs.length} gmax forms on PokeAPI`);

let added = 0;
const skipped = [];
for (const gslug of gmaxSlugs) {
  const p = await fetchJson(`${API}/pokemon/${gslug}`);
  const speciesId = Number(p.species.url.match(/\/(\d+)\/?$/)[1]);
  const base = baseBySpecies.get(speciesId);
  if (!base) {
    skipped.push(`${gslug} (no base for species ${speciesId})`);
    continue;
  }
  const slug = `${base.slug}-gmax`;
  if (pokedex[slug]) continue;
  const stats = {};
  for (const s of p.stats) stats[s.stat.name] = s.base_stat;
  pokedex[slug] = {
    id: p.id,
    speciesId,
    slug,
    name: `${base.name} Gigantamax`,
    types: p.types.map((t) => t.type.name),
    stats,
    abilities: p.abilities.map((a) => ({ slug: a.ability.name, hidden: a.is_hidden })),
    heightM: p.height / 10,
    weightKg: p.weight / 10,
    generation: base.generation ?? null,
    sprite: p.sprites.front_default,
    spriteShiny: p.sprites.front_shiny ?? null,
    artwork: p.sprites.other?.["official-artwork"]?.front_default ?? p.sprites.front_default,
    artworkShiny: p.sprites.other?.["official-artwork"]?.front_shiny ?? p.sprites.front_shiny ?? null,
    spritePbo: pboSprite(slug, false),
    spritePboShiny: pboSprite(slug, true),
    evYield: null,
    flavor: null,
    flavorEs: base.flavorEs ?? null,
    flavorZh: base.flavorZh ?? null,
    evolutionLine: base.evolutionLine ?? [],
  };
  added++;
}

await writeFile(POKEDEX, JSON.stringify(pokedex, null, 1), "utf8");
console.log(`gmax: added ${added}; pokedex now ${Object.keys(pokedex).length} entries`);
if (skipped.length) console.log("skipped:", skipped.join("; "));
