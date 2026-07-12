// One-off patch: annotate each pokedex.json evolutionLine member with `from`
// (parent slug) + `depth`, using PokeAPI evolution chains. This restores the
// branch structure that flattenChain drops, so the ficha can render Eevee-style
// trees correctly instead of a bogus linear chain. Caches to .cache/pokeapi.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchText } from "./lib/http.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://pokeapi.co/api/v2";
const POKEDEX = path.join(ROOT, "data", "pokedex.json");
const fetchJson = async (url) => JSON.parse(await fetchText(url, { subdir: "pokeapi", delayMs: 150 }));

// 1. Walk every chain -> global species slug -> {from, depth}.
const tree = new Map();
const list = await fetchJson(`${API}/evolution-chain?limit=2000`);
let done = 0;
for (const { url } of list.results) {
  try {
    const { chain } = await fetchJson(url);
    const walk = (node, from, depth) => {
      tree.set(node.species.name, { from, depth });
      for (const n of node.evolves_to) walk(n, node.species.name, depth + 1);
    };
    walk(chain, null, 0);
  } catch (err) {
    console.warn(`\nskip ${url}: ${err.message}`);
  }
  process.stdout.write(`\r${++done}/${list.results.length} chains  `);
}
console.log(`\n${tree.size} species mapped`);

// 2. Patch evolutionLine members (match by slug; unique within a line).
const pokedex = JSON.parse(await readFile(POKEDEX, "utf8"));
let annotated = 0;
const branched = [];
for (const [slug, entry] of Object.entries(pokedex)) {
  if (!entry.evolutionLine) continue;
  for (const m of entry.evolutionLine) {
    const t = tree.get(m.slug);
    m.from = t ? t.from : null;
    m.depth = t ? t.depth : 0;
    annotated++;
  }
  const kids = {};
  for (const m of entry.evolutionLine) if (m.from) kids[m.from] = (kids[m.from] ?? 0) + 1;
  if (Object.values(kids).some((c) => c > 1) && !branched.includes(entry.evolutionLine[0].slug)) {
    branched.push(entry.evolutionLine[0].slug);
  }
}
await writeFile(POKEDEX, JSON.stringify(pokedex), "utf8"); // minified: matches repo convention
console.log(`annotated ${annotated} members; ${branched.length} branched families:`);
console.log(branched.sort().join(", "));
