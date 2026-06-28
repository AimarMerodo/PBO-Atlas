// Builds the character dress-up dataset for the /locker tool.
// - Copies the paper-doll sprite sheets from the game client into public/sprites/pbo/paperdolls.
// - Reads items.csv (+ localized name CSVs) and writes public/data/dressup.json.
// Slots are the game's real PaperDollType channels: items.csv column 5 holds either the
// channel name (SHOE, PANTS, ...) or its ordinal (0-11). Both decoded from the jar enum.
// Sprites come from the local PBO install (devs granted permission); falls back to public/.
import fs from "node:fs";
import path from "node:path";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const cache = path.join(REPO, "scripts/.cache/game");
// Point PBO_GAME_DIR at your local PBO install to re-copy raw assets; otherwise the
// already-committed sprites in public/ are reused.
const GAME = process.env.PBO_GAME_DIR || "";
const gamePD = path.join(GAME, "assets/ui/sprite/paperdolls");
const outSprites = path.join(REPO, "public/sprites/pbo/paperdolls");
const outData = path.join(REPO, "public/data/dressup.json");

// --- 1. Copy paper-doll sheets (raw assets) ---
fs.mkdirSync(outSprites, { recursive: true });
const pdSrc = fs.existsSync(gamePD) ? gamePD : outSprites;
const pdFiles = fs.readdirSync(pdSrc).filter((f) => f.endsWith(".png"));
if (pdSrc === gamePD) {
  for (const f of pdFiles) fs.copyFileSync(path.join(gamePD, f), path.join(outSprites, f));
  console.log(`copied ${pdFiles.length} paper-doll sheets -> public/sprites/pbo/paperdolls`);
} else {
  console.log(`game dir not found; using ${pdFiles.length} sheets already in public/`);
}
const pdHave = new Set(pdFiles.map((f) => f.slice(0, -4)));

// --- 2. PaperDollType enum (decompiled from pbo.jar) ---
const ENUM = ["HAIR", "CAP", "GLASSES", "GLOVES", "PANTS", "SHIRT", "JACKET", "BEARD", "SHOE", "WINGS", "TAIL", "BEAK"];
// Draw-layer id per channel (back -> front, lower id drawn first). From the enum ctor.
// items.csv col 5 stores EITHER the channel name OR this id (not the ordinal).
const DRAW_ID = { HAIR: 0, CAP: 1, GLASSES: 2, GLOVES: 3, PANTS: 4, SHIRT: 5, JACKET: 6, SHOE: 7, BEARD: 8, WINGS: 9, BEAK: 10, TAIL: 11 };
const ID_TO_CHANNEL = Object.fromEntries(Object.entries(DRAW_ID).map(([ch, id]) => [id, ch]));
// Render order: base body first, then channels by draw id.
const slotOrder = ["BODY", ...[...ENUM].sort((a, b) => DRAW_ID[a] - DRAW_ID[b])];

function channelOf(col5) {
  const v = (col5 ?? "").trim();
  if (/^[A-Z]+$/.test(v) && ENUM.includes(v)) return v;
  if (/^\d+$/.test(v)) return ID_TO_CHANNEL[Number(v)] ?? null;
  return null;
}
const detectGender = (name) => (/\(female\)/i.test(name) ? "F" : /\(male\)/i.test(name) ? "M" : "U");

// --- 3. Localized name maps (English -> es/pt/zh) ---
function nameMap(file) {
  const m = new Map();
  const p = path.join(cache, "i18n", file);
  if (!fs.existsSync(p)) return m;
  for (const ln of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const c = ln.split(",");
    if (c[0] && c[1]) m.set(c[0], c[1]);
  }
  return m;
}
const esMap = nameMap("items_es.csv"), ptMap = nameMap("items_pt.csv"), zhMap = nameMap("items_zh.csv");

// --- 4. Catalog from items.csv (slot = real PaperDollType channel) ---
const rows = fs.readFileSync(path.join(cache, "item/items.csv"), "utf8").split(/\r?\n/);
const items = [];
const seen = new Set();
const byName = new Map();
let skipped = 0;
for (const ln of rows) {
  const c = ln.split(",");
  if (c[1] !== "Customisation") continue;
  const name = c[0], pid = c[6];
  if (!/^\d+$/.test(pid) || !pdHave.has(pid)) continue;
  const slot = channelOf(c[5]);
  if (!slot) { skipped++; continue; }
  const key = name + "|" + pid;
  if (seen.has(key)) continue;
  seen.add(key);
  const e = { name, pid, slot, gender: detectGender(name) };
  if (esMap.get(name)) e.es = esMap.get(name);
  if (ptMap.get(name)) e.pt = ptMap.get(name);
  if (zhMap.get(name)) e.zh = zhMap.get(name);
  items.push(e);
  if (!byName.has(name)) byName.set(name, e);
}
items.sort((a, b) => DRAW_ID[a.slot] - DRAW_ID[b.slot] || a.name.localeCompare(b.name));

// --- 5. Mounts (same 256x256 / 64px-cell grid -> rendered as back + front layers) ---
const mfSrc = path.join(GAME, "assets/ui/sprite/mounts/mount_front");
const mbSrc = path.join(GAME, "assets/ui/sprite/mounts/mount_back");
const mfOut = path.join(REPO, "public/sprites/pbo/mounts/front");
const mbOut = path.join(REPO, "public/sprites/pbo/mounts/back");
fs.mkdirSync(mfOut, { recursive: true });
fs.mkdirSync(mbOut, { recursive: true });
const fromGameMounts = fs.existsSync(mfSrc);
const listIds = (dir) => new Set(fs.readdirSync(dir).filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)));
const haveFront = listIds(fromGameMounts ? mfSrc : mfOut);
const haveBack = listIds(fromGameMounts ? mbSrc : mbOut);
// Mount sheets vary in size: cell = sheetHeight/4 (64 or 96), cols = sheetWidth/cell (4 or 8).
const pngSize = (file) => { const b = fs.readFileSync(file); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const mountRows = fs.readFileSync(path.join(cache, "item/mounts.csv"), "utf8").split(/\r?\n/);
const mounts = [];
const seenMount = new Set();
for (const ln of mountRows) {
  const c = ln.split(",");
  const name = c[0], type = c[1], sid = c[4]; // col 4 = mount sprite id, col 3 = rider y-offset
  if (!name || !/^\d+$/.test(sid)) continue;
  if (!haveFront.has(sid) || !haveBack.has(sid) || seenMount.has(sid)) continue;
  seenMount.add(sid);
  if (fromGameMounts) {
    fs.copyFileSync(path.join(mfSrc, sid + ".png"), path.join(mfOut, sid + ".png"));
    fs.copyFileSync(path.join(mbSrc, sid + ".png"), path.join(mbOut, sid + ".png"));
  }
  const [w, h] = pngSize(path.join(mbOut, sid + ".png"));
  const cell = Math.round(h / 4);
  const e = { id: sid, name, type, cell, cols: Math.round(w / cell), oy: Number.parseInt(c[3], 10) || 0 };
  if (esMap.get(name)) e.es = esMap.get(name);
  if (ptMap.get(name)) e.pt = ptMap.get(name);
  if (zhMap.get(name)) e.zh = zhMap.get(name);
  mounts.push(e);
}
mounts.sort((a, b) => a.name.localeCompare(b.name));
console.log(`mounts: ${mounts.length} (copied front+back: ${fromGameMounts})`);

// --- 6. Riding-pose sprites (used while mounted): seated/gripping base body + cosmetics ---
const rideBaseSrc = path.join(GAME, "assets/ui/sprite/mounts/base");
const ridePdSrc = path.join(GAME, "assets/ui/sprite/mounts/paperdoll");
const rideBaseOut = path.join(REPO, "public/sprites/pbo/mounts/ride-base");
const rideOut = path.join(REPO, "public/sprites/pbo/mounts/ride");
fs.mkdirSync(rideBaseOut, { recursive: true });
fs.mkdirSync(rideOut, { recursive: true });
let rideBodies;
if (fs.existsSync(rideBaseSrc)) {
  const baseFiles = fs.readdirSync(rideBaseSrc).filter((f) => f.endsWith(".png"));
  for (const f of baseFiles) fs.copyFileSync(path.join(rideBaseSrc, f), path.join(rideBaseOut, f));
  let n = 0;
  for (const f of fs.readdirSync(ridePdSrc).filter((f) => f.endsWith(".png"))) { fs.copyFileSync(path.join(ridePdSrc, f), path.join(rideOut, f)); n++; }
  rideBodies = baseFiles.map((f) => f.slice(0, -4)).sort();
  console.log(`ride sprites copied: ${n} cosmetics, ${rideBodies.length} base bodies`);
} else {
  rideBodies = fs.readdirSync(rideBaseOut).filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)).sort();
}

// Mark items that ship a seated riding variant (mounts/paperdoll/<pid>). The game, while mounted,
// draws the riding variant if it exists; for the few cosmetics without one it keeps the walking
// sprite for head accessories (HAIR/CAP/BEARD/GLASSES/BEAK) and hides body garments. `ride` lets
// the /locker canvas reproduce that without 404-probing each sprite.
const ridePidSet = new Set(fs.readdirSync(rideOut).filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)));
let rideCount = 0;
for (const it of items) if (ridePidSet.has(it.pid)) { it.ride = 1; rideCount++; }
console.log(`ride variants matched to catalog: ${rideCount}/${items.length} items`);

// "Where to find": attach a short source string from data/item-sources.json (keyed by item slug).
// Only ~few % of cosmetics are sourced (drops/shops); the rest stay undefined (no UI shown).
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const srcPath = path.join(REPO, "data/item-sources.json");
let whereCount = 0;
if (fs.existsSync(srcPath)) {
  const srcMap = JSON.parse(fs.readFileSync(srcPath, "utf8")).sources ?? {};
  const oneSource = (s) =>
    s.method === "drop" ? `Drops from ${s.pokemonName || s.pokemon}` : [s.source, s.detail].filter(Boolean).join(" · ");
  for (const it of items) {
    const list = srcMap[slugify(it.name)];
    if (!list || !list.length) continue;
    it.where = [...new Set(list.map(oneSource).filter(Boolean))].slice(0, 2).join("  /  ");
    if (it.where) whereCount++;
  }
}
console.log(`where-to-find matched: ${whereCount}/${items.length} items`);

const data = {
  bodies: ["1", "2", "3", "4"].filter((b) => pdHave.has(b)),
  rideBodies,
  slotOrder,
  items,
  mounts,
};
fs.mkdirSync(path.dirname(outData), { recursive: true });
fs.writeFileSync(outData, JSON.stringify(data));
console.log(`dressup.json -> ${items.length} items, ${mounts.length} mounts, ${data.bodies.length} bodies (skipped ${skipped} with unresolved channel)`);
