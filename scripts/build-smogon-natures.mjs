// Recommended competitive natures per Pokémon, from Smogon's analysis sets
// (via the @pkmn/smogon data dumps). Smogon publishes sets PER GENERATION, so for
// each mon we take the newest generation that has data (gen 9 → 8 → 7, which covers
// the full national dex). Natures are ordered the way Smogon presents them: the mon's
// most standard tier first (OU → UU → …), and within a tier in set order — so the
// ranking matches what you see on Smogon. Each nature also carries its localized name
// and the tier it came from (for a deep link). Output: data/smogon-natures.json.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const GENS = [9, 8, 7]; // newest first; first gen with data wins per mon
const MAX_NATURES = 6;
const MAX_SETS = 3;

// Tier order used to sort a mon's formats (most standard first). Unlisted → last.
const FORMAT_PRIORITY = [
  "ou", "ubers", "uu", "ru", "nu", "pu", "zu", "lc", "nfe",
  "nationaldex", "nationaldexuu", "nationaldexru", "nationaldexubers", "nationaldexmonotype", "nationaldexdoubles",
  "monotype", "doublesou", "1v1", "battlestadiumsingles",
  "almostanyability", "mixandmega", "stabmons", "godlygift", "partnersincrime", "cap",
  "vgc2025", "vgc2024", "vgc2023", "anythinggoes", "balancedhackmons", "inheritance", "ubersuu",
];
const prio = (f) => {
  const i = FORMAT_PRIORITY.indexOf(f);
  return i === -1 ? FORMAT_PRIORITY.length : i;
};

// "Other Metagames" — non-standard natures (built around unusual abilities/items).
const EXCLUDE_FORMATS = new Set([
  "balancedhackmons",
  "almostanyability",
  "mixandmega",
  "stabmons",
  "godlygift",
  "inheritance",
  "partnersincrime",
  "cap",
]);

const slugify = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const pokedex = JSON.parse(await readFile(path.join(ROOT, "data/pokedex.json"), "utf8"));
const slugs = new Set(Object.keys(pokedex));
const natures = JSON.parse(await readFile(path.join(ROOT, "data/natures.json"), "utf8"));
// nature name -> {up, down (null if neutral), es, pt, zh}
const natInfo = new Map(
  natures.map((n) => [n.name, { ...(n.up === n.down ? {} : { up: n.up, down: n.down }), es: n.es, pt: n.pt, zh: n.zh }]),
);

function resolve(name) {
  const s = slugify(name);
  if (slugs.has(s)) return s;
  const parts = s.split("-");
  while (parts.length > 1) {
    parts.pop();
    if (slugs.has(parts.join("-"))) return parts.join("-");
  }
  return null;
}

async function fetchGen(gen) {
  const url = `https://pkmn.github.io/smogon/data/sets/gen${gen}.json`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400 * attempt));
  }
  throw new Error(`could not fetch ${url}`);
}

const out = {}; // slug -> { gen, natures: Map (insertion-ordered = Smogon order) }
const unmatched = new Set();

for (const gen of GENS) {
  const data = await fetchGen(gen);
  for (const [name, formats] of Object.entries(data)) {
    const slug = resolve(name);
    if (!slug) {
      unmatched.add(name);
      continue;
    }
    // Only standard tiers give sensible natures. "Other Metagames" (Balanced Hackmons,
    // AAA, Mix and Mega, STABmons, etc.) run weird ability/item natures — and they're the
    // only place mega forms appear as "X-Mega", so dropping them also stops those fringe
    // natures from polluting a mon's page. A mon with ONLY OM data this gen is skipped so
    // an older gen with real data can win instead.
    const usable = Object.keys(formats).filter((f) => !EXCLUDE_FORMATS.has(f));
    if (!usable.length) continue;
    if (out[slug] && out[slug].gen !== gen) continue; // older gen: a newer one already won
    const entry = (out[slug] ??= { gen, natures: new Map() });
    // Walk formats in tier order, sets in their given order → first-seen order = Smogon order.
    for (const fmt of usable.sort((a, b) => prio(a) - prio(b))) {
      for (const [setName, set] of Object.entries(formats[fmt])) {
        const nats = Array.isArray(set.nature) ? set.nature : set.nature ? [set.nature] : [];
        for (const nat of nats) {
          let rec = entry.natures.get(nat);
          if (!rec) {
            rec = { sets: new Set(), format: fmt }; // first-seen tier is the highest-priority one
            entry.natures.set(nat, rec);
          }
          if (rec.sets.size < MAX_SETS) rec.sets.add(setName);
        }
      }
    }
  }
}

const result = {};
for (const [slug, entry] of Object.entries(out)) {
  const list = [...entry.natures.entries()].slice(0, MAX_NATURES).map(([nature, rec]) => ({
    nature,
    ...(natInfo.get(nature) ?? {}),
    sets: [...rec.sets],
    format: rec.format,
  }));
  if (list.length) result[slug] = { gen: entry.gen, natures: list };
}

await writeFile(path.join(ROOT, "data/smogon-natures.json"), JSON.stringify(result), "utf8");
console.log(`smogon-natures: ${Object.keys(result).length} pokémon (gens ${GENS.join("/")}, Smogon order), ${unmatched.size} unmatched`);
