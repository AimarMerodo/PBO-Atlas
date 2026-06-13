// Build natures, items (+icon atlas coords), mounts and cosmetics JSONs from
// the extracted game data (scripts/extract-game-data.ps1 must run first).
// Usage: node scripts/build-game-extras.mjs

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv, parseLocalizedMap, parseNameMap } from "./lib/csv.mjs";
import { slugify } from "./lib/normalize.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const GAME = path.join(ROOT, "scripts", ".cache", "game");
const DATA = path.join(ROOT, "data");

const read = (...p) => readFile(path.join(GAME, ...p), "utf8");

// --- Natures ---
const natureEs = parseNameMap(await read("nature", "nature_es.csv"));
const naturePt = parseNameMap(await read("nature", "nature_pt.csv"));
const natureZh = parseNameMap(await read("nature", "nature_zh.csv"));
const STAT = { ATK: "attack", DEF: "defense", SP_ATK: "special-attack", SP_DEF: "special-defense", SPEED: "speed", SP: "special-defense", NONE: null };
const natures = parseCsv(await read("nature", "nature_list.csv"))
  .filter((r) => r[0])
  .map(([name, up, down]) => ({
    name,
    es: natureEs[name] ?? name,
    pt: naturePt[name] ?? name,
    zh: natureZh[name] ?? name,
    up: STAT[up?.trim()] ?? null,
    down: STAT[down?.trim()] ?? null,
  }));
await writeFile(path.join(DATA, "natures.json"), JSON.stringify(natures, null, 1), "utf8");
console.log(`natures: ${natures.length}`);

// --- Item icon atlases (libGDX multi-page format) -> coords ---
const icons = {};
function parseAtlas(text) {
  let page = null;
  let pageW = 0;
  let pageH = 0;
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      page = null; // blank line precedes the next page header
      continue;
    }
    if (line.trim().endsWith(".png")) {
      page = line.trim();
      current = null;
    } else if (line.startsWith("size:") && page && !current) {
      [pageW, pageH] = line.split(":")[1].split(",").map((n) => Number(n.trim()));
    } else if (!line.startsWith(" ") && !line.includes(":")) {
      current = line.trim();
    } else if (current && line.trim().startsWith("xy:")) {
      const [x, y] = line.split(":")[1].split(",").map((n) => Number(n.trim()));
      icons[current] ??= { page, x, y, pageW, pageH };
    } else if (current && line.trim().startsWith("size:") && icons[current] && icons[current].w === undefined) {
      const [w, h] = line.split(":")[1].split(",").map((n) => Number(n.trim()));
      if (icons[current].page === page) {
        icons[current].w = w;
        icons[current].h = h;
      }
    }
  }
}
for (const atlas of ["item_pack.atlas", "donator_pack.atlas", "item_icons_4x.atlas"]) {
  parseAtlas(await readFile(path.join(GAME, atlas), "utf8"));
}
console.log(`atlas icons: ${Object.keys(icons).length}`);

// Machine items ("Gen7 TM01", "TM27", "TR05", "HM02") get the typed disc
// icon (tr-<type>) of the move they teach.
const moveType = {};
const moveNames = {};
{
  const movesData = JSON.parse(await readFile(path.join(ROOT, "data", "moves.json"), "utf8"));
  for (const m of Object.values(movesData.moves)) {
    moveType[m.en.toLowerCase()] = m.type;
    moveNames[m.en.toLowerCase()] = { es: m.es ?? null, zh: m.zh ?? null, pt: m.pt ?? null };
  }
}
const machineMove = {};
const loadTmMap = async (file, prefix) => {
  try {
    for (const [num, name] of parseCsv(await read("machines", file))) {
      if (name) machineMove[`${prefix}${String(Number(num)).padStart(2, "0")}`] = name;
    }
  } catch {
    /* map not extracted */
  }
};
await loadTmMap("gen7_tm_map.csv", "Gen7 TM");
await loadTmMap("gen_8_tm_map.csv", "TM");
await loadTmMap("gen_8_tr_map.csv", "TR");
await loadTmMap("hm_map.csv", "HM");
try {
  for (const [num, name] of parseCsv(await read("machines", "gen_9_tm_map.csv"))) {
    if (name) machineMove[`Gen9 TM${String(Number(num)).padStart(3, "0")}`] = name;
  }
} catch {
  /* ignore */
}

function machineIcon(itemName) {
  const move = machineMove[itemName.trim()];
  const type = move ? moveType[move.toLowerCase()] : null;
  return (type && icons[`tr-${type}`]) || icons["broken-tm-disk"] || null;
}

/** Atlas region names keep punctuation: "wailmer-surf-mount-(shiny)". */
function findIcon(name) {
  const base = name.trim();
  const noParens = base.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const noBlueprint = noParens.replace(/\s+Blueprint$/i, "");
  const noFirstWord = noBlueprint.split(/\s+/).slice(1).join(" ");
  const dash = (s) => s.toLowerCase().trim().replace(/\s+/g, "-");
  const candidates = [dash(base), slugify(base), dash(noParens), slugify(noParens), dash(noBlueprint)];
  if (noFirstWord.split(/\s+/).length >= 2) candidates.push(dash(noFirstWord));
  for (const c of candidates) if (c && icons[c]) return icons[c];
  return null;
}

// --- Items ---
// Game i18n CSVs carry both the translated name and the translated description.
const itemsEs = parseLocalizedMap(await read("i18n", "items_es.csv"));
const itemsPt = parseLocalizedMap(await read("i18n", "items_pt.csv"));
const itemsZh = parseLocalizedMap(await read("i18n", "items_zh.csv"));

// items.csv category casing is inconsistent ("Hold items"/"Hold Items"...);
// normalize so the category filter has no duplicates.
const CATEGORIES = [
  "Medicine",
  "Battle items",
  "Hold items",
  "Selling items",
  "General items",
  "Berries",
  "Pokeballs",
  "Machines",
  "Spawn item",
  "Customisation",
];
const canonicalCategory = Object.fromEntries(CATEGORIES.map((c) => [c.toLowerCase(), c]));

// Reverse index: evolution triggers "use <Item>" -> pokemon that evolve with it.
const evolvesByItem = {};
{
  const pokedex = JSON.parse(await readFile(path.join(ROOT, "data", "pokedex.json"), "utf8"));
  for (const entry of Object.values(pokedex)) {
    for (const stage of entry.evolutionLine ?? []) {
      const m = stage.trigger?.match(/use ([^,]+)/i);
      if (!m) continue;
      const key = m[1].trim().toLowerCase();
      evolvesByItem[key] ??= new Map();
      evolvesByItem[key].set(stage.slug, stage.name);
    }
  }
}

const items = [];
for (const r of parseCsv(await read("item", "items.csv"))) {
  const [name, rawCategory, description, id] = r;
  if (!name || !id) continue;
  const slug = slugify(name);
  const category = canonicalCategory[(rawCategory || "Misc").trim().toLowerCase()] ?? (rawCategory || "Misc");
  const key = name.trim();
  const teachesName = machineMove[key] ?? null;
  const teachesLocal = teachesName ? moveNames[teachesName.toLowerCase()] : null;
  const evolves = evolvesByItem[key.toLowerCase()];
  items.push({
    id: Number(id),
    slug,
    name,
    es: itemsEs[key]?.name ?? null,
    pt: itemsPt[key]?.name ?? null,
    zh: itemsZh[key]?.name ?? null,
    category,
    description: description || "",
    descEs: itemsEs[key]?.desc ?? null,
    descPt: itemsPt[key]?.desc ?? null,
    descZh: itemsZh[key]?.desc ?? null,
    icon: findIcon(name) ?? (category === "Machines" ? machineIcon(name) : null),
    teaches: teachesName
      ? {
          name: teachesName,
          es: teachesLocal?.es ?? null,
          zh: teachesLocal?.zh ?? null,
          pt: teachesLocal?.pt ?? null,
          type: moveType[teachesName.toLowerCase()] ?? null,
        }
      : null,
    evolves: evolves ? [...evolves].map(([s, n]) => ({ slug: s, name: n })) : null,
  });
}
items.sort((a, b) => a.name.localeCompare(b.name));
const withIcon = items.filter((i) => i.icon).length;
await writeFile(path.join(DATA, "items.json"), JSON.stringify({ items }), "utf8");
console.log(`items: ${items.length} (${withIcon} with icon)`);

// --- Mounts ---
const mounts = parseCsv(await read("item", "mounts.csv"))
  .filter((r) => r[0])
  .map(([name, type]) => ({
    name,
    es: itemsEs[name.trim()]?.name ?? null,
    pt: itemsPt[name.trim()]?.name ?? null,
    zh: itemsZh[name.trim()]?.name ?? null,
    type: type?.trim() ?? "",
    icon: findIcon(name),
  }));
await writeFile(path.join(DATA, "mounts.json"), JSON.stringify(mounts, null, 1), "utf8");
const mountsLocalized = mounts.filter((m) => m.zh).length;
console.log(`mounts: ${mounts.length} (${mounts.filter((m) => m.icon).length} with icon, ${mountsLocalized} localized)`);

// --- Cosmetic bundles ---
const bundleDir = path.join(GAME, "bundles");
const bundles = [];
for (const file of (await readdir(bundleDir)).sort()) {
  if (!file.endsWith(".json")) continue;
  try {
    const data = JSON.parse(await readFile(path.join(bundleDir, file), "utf8"));
    const name = file
      .replace(/\.json$/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const entries = Array.isArray(data) ? data : [data];
    const itemNames = [...new Set(entries.flatMap((e) => (e.items ?? []).map((i) => i.name)).filter(Boolean))];
    if (itemNames.length) {
      const pieces = itemNames.map((n) => ({
        name: n,
        es: itemsEs[n.trim()]?.name ?? null,
        pt: itemsPt[n.trim()]?.name ?? null,
        zh: itemsZh[n.trim()]?.name ?? null,
        icon: findIcon(n),
      }));
      bundles.push({
        slug: slugify(name),
        name,
        icon: findIcon(name) ?? findIcon(`${name.replace(/ Bundle$/i, "")} Costume Bundle`) ?? pieces.find((p) => p.icon)?.icon ?? null,
        items: pieces,
      });
    }
  } catch {
    console.warn(`skipping unparsable bundle: ${file}`);
  }
}
await writeFile(path.join(DATA, "cosmetics.json"), JSON.stringify(bundles, null, 1), "utf8");
console.log(`cosmetic bundles: ${bundles.length}`);
