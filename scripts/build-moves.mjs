// Build src/data/moves.json from the GAME's own data (devs granted asset use):
//   - learnsets: scripts/.cache/game/pokedex/pokemondata.json (exact in-game)
//   - move details: scripts/.cache/game/pokedex/showdown/gen9moves.json
//   - localized names/descriptions: pokedex/translated_moves.csv (PBO official)
//   - TM numbers: machines/gen_9_tm_map.csv, HMs: machines/hm_map.csv
// Run scripts/extract-game-data.ps1 first to populate scripts/.cache/game.
// Usage: node scripts/build-moves.mjs

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv } from "./lib/csv.mjs";
import { showdownCandidates } from "./lib/showdown-ids.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const GAME = path.join(ROOT, "scripts", ".cache", "game");
const POKEDEX_FILE = path.join(ROOT, "src", "data", "pokedex.json");
const OUT_FILE = path.join(ROOT, "src", "data", "moves.json");

const moveId = (displayName) => displayName.toLowerCase().replace(/[^a-z0-9]/g, "");

// --- Load sources ---
const gameData = JSON.parse(await readFile(path.join(GAME, "pokedex", "pokemondata.json"), "utf8"));
const showdownMoves = JSON.parse(await readFile(path.join(GAME, "pokedex", "showdown", "gen9moves.json"), "utf8"));
const pokedex = JSON.parse(await readFile(POKEDEX_FILE, "utf8"));

// translated_moves.csv: ID,Name,Desc(Short),Name(zh),Desc(zh),Name(es),Desc(es),Name(de),Name(pt)
const translated = {};
for (const r of parseCsv(await readFile(path.join(GAME, "pokedex", "translated_moves.csv"), "utf8")).slice(1)) {
  translated[r[0]] = { en: r[1], descEn: r[2], zh: r[3], descZh: r[4], es: r[5], descEs: r[6], pt: r[8] };
}

// TM/HM numbers by move id
const tmByMove = {};
for (const [num, name] of parseCsv(await readFile(path.join(GAME, "machines", "gen_9_tm_map.csv"), "utf8"))) {
  if (name) tmByMove[moveId(name)] = `TM${String(num).padStart(2, "0")}`;
}
for (const [num, name] of parseCsv(await readFile(path.join(GAME, "machines", "hm_map.csv"), "utf8"))) {
  if (name) tmByMove[moveId(name)] = `HM${String(num).padStart(2, "0")}`;
}

// Index game entries by showdownId
const byShowdownId = new Map(gameData.map((p) => [p.showdownId, p]));

const moves = {};
const learnsets = {};
const warnings = new Set();

function registerMove(displayName) {
  const id = moveId(displayName);
  if (moves[id]) return id;
  const sd = showdownMoves[id];
  const tr = translated[id];
  if (!sd && !tr) warnings.add(`no data for move "${displayName}"`);
  moves[id] = {
    en: sd?.name ?? tr?.en ?? displayName,
    es: tr?.es || sd?.name || displayName,
    zh: tr?.zh || null,
    pt: tr?.pt || null,
    descEn: tr?.descEn || sd?.shortDesc || sd?.desc || "",
    descEs: tr?.descEs || null,
    descZh: tr?.descZh || null,
    type: (sd?.type ?? "normal").toLowerCase(),
    class: (sd?.category ?? "status").toLowerCase(),
    power: sd?.basePower || null,
    accuracy: typeof sd?.accuracy === "number" ? sd.accuracy : null,
    pp: sd?.pp ?? null,
    tm: tmByMove[id] ?? null,
  };
  return id;
}

let matched = 0;
for (const [slug, entry] of Object.entries(pokedex)) {
  let game = null;
  for (const cand of showdownCandidates(slug)) {
    game = byShowdownId.get(cand);
    if (game) break;
  }
  if (!game) continue;
  matched++;

  const level = [];
  for (const [lvl, names] of Object.entries(game.levelUpMoves ?? {})) {
    for (const n of names) level.push([registerMove(n), Number(lvl)]);
  }
  level.sort((a, b) => a[1] - b[1]);
  for (const n of game.evoMoves ?? []) level.push([registerMove(n), 0]);

  const machine = [
    ...Object.values(game.tmMovesByMachineType ?? {}).flat(),
    ...(game.hmMoves ?? []),
  ].map(registerMove);

  learnsets[slug] = {
    vg: "pbo",
    level,
    machine: [...new Set(machine)].sort((a, b) => moves[a].en.localeCompare(moves[b].en)),
    egg: [...new Set((game.eggMoves ?? []).map(registerMove))].sort(),
    tutor: [...new Set((game.tutorMoves ?? []).map(registerMove))].sort(),
  };
}

await writeFile(OUT_FILE, JSON.stringify({ moves, learnsets }), "utf8");
const mb = (Buffer.byteLength(JSON.stringify({ moves, learnsets })) / 1024 / 1024).toFixed(1);
console.log(
  `Matched ${matched}/${Object.keys(pokedex).length} pokedex entries to game data; ` +
    `${Object.keys(moves).length} moves (${mb} MB) -> ${path.relative(ROOT, OUT_FILE)}`
);
if (warnings.size) {
  console.log(`${warnings.size} warnings:`);
  for (const w of [...warnings].slice(0, 20)) console.log(`  - ${w}`);
}
