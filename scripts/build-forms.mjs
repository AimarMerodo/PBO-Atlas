// Build data/forms.json: Mega Evolutions, Primal Reversions and Gigantamax forms
// per Pokemon, sourced from the canonical Pokemon Showdown dex (types, base stats,
// sprite id and the required Mega Stone). Attached to each pokemon page by
// build-page-data.mjs. Run: node scripts/build-forms.mjs
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "data");
const readJson = async (f) => JSON.parse(await readFile(path.join(SRC, f), "utf8"));

const pokedex = await readJson("pokedex.json");
const items = (await readJson("items.json")).items;
// Match Showdown base species -> our slug by display name (handles PokeAPI form
// slugs like "urshifu-single-strike" whose display name is still "Urshifu").
const nameToSlug = new Map(Object.values(pokedex).map((p) => [p.name.toLowerCase(), p.slug]));
const itemNameToSlug = new Map(items.map((i) => [i.name.toLowerCase(), i.slug]));

const STAT_MAP = { hp: "hp", atk: "attack", def: "defense", spa: "special-attack", spd: "special-defense", spe: "speed" };
const toId = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const FORME_RE = /^(Mega(-[XY])?|Primal|Gmax)$/;

const res = await fetch("https://play.pokemonshowdown.com/data/pokedex.json", { headers: { "User-Agent": "Mozilla/5.0" } });
if (!res.ok) throw new Error(`Showdown dex fetch failed: ${res.status}`);
const dex = await res.json();

const out = {};
const skipped = [];
for (const p of Object.values(dex)) {
  if (!p.forme || !FORME_RE.test(p.forme)) continue;
  const slug = nameToSlug.get((p.baseSpecies || "").toLowerCase());
  if (!slug) {
    skipped.push(p.name);
    continue;
  }
  const kind = p.forme === "Primal" ? "primal" : p.forme === "Gmax" ? "gmax" : "mega";
  const spriteId = `${toId(p.baseSpecies)}-${toId(p.forme)}`;
  const suffix = p.forme === "Mega-X" ? " X" : p.forme === "Mega-Y" ? " Y" : "";
  const name =
    kind === "gmax" ? `Gigantamax ${p.baseSpecies}` : kind === "primal" ? `Primal ${p.baseSpecies}` : `Mega ${p.baseSpecies}${suffix}`;
  const stats = {};
  for (const [k, v] of Object.entries(STAT_MAP)) stats[v] = p.baseStats[k];
  const stoneSlug = p.requiredItem ? (itemNameToSlug.get(p.requiredItem.toLowerCase()) ?? null) : null;
  (out[slug] ??= []).push({ kind, name, spriteId, types: p.types.map((t) => t.toLowerCase()), stats, stoneSlug });
}

const order = { mega: 0, primal: 1, gmax: 2 };
for (const slug of Object.keys(out)) out[slug].sort((a, b) => order[a.kind] - order[b.kind] || a.name.localeCompare(b.name));

const note =
  "Mega Evolutions, Primal Reversions and Gigantamax forms per pokemon (canonical, from the Pokemon Showdown dex). kind ∈ mega|primal|gmax. stoneSlug links the required Mega Stone item when PBO has it.";
await writeFile(path.join(SRC, "forms.json"), JSON.stringify({ note, forms: out }), "utf8");

const total = Object.values(out).reduce((n, a) => n + a.length, 0);
console.log(`forms: ${Object.keys(out).length} pokemon, ${total} forms`);
if (skipped.length) console.log(`skipped ${skipped.length} (base species not in dex): ${skipped.join(", ")}`);
