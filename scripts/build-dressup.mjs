// Builds the character dress-up dataset for the /dressup tool.
// - Copies the paper-doll sprite sheets from the game client into public/sprites/pbo/paperdolls.
// - Reads items.csv (+ localized name CSVs) and writes public/data/dressup.json.
// Sprites come from the local PBO install (devs granted permission). If the install
// isn't present, it falls back to the already-copied sprites under public/.
import fs from "node:fs";
import path from "node:path";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const cache = path.join(REPO, "scripts/.cache/game");
const GAME = process.env.PBO_GAME_DIR || "C:/Users/Aimar/Desktop/cosas/pbo-windows";
const gamePD = path.join(GAME, "assets/ui/sprite/paperdolls");
const outSprites = path.join(REPO, "public/sprites/pbo/paperdolls");
const outData = path.join(REPO, "public/data/dressup.json");

// --- 1. Copy paper-doll sheets (raw assets) ---
fs.mkdirSync(outSprites, { recursive: true });
let pdSrc = fs.existsSync(gamePD) ? gamePD : outSprites;
const pdFiles = fs.readdirSync(pdSrc).filter((f) => f.endsWith(".png"));
if (pdSrc === gamePD) {
  for (const f of pdFiles) fs.copyFileSync(path.join(gamePD, f), path.join(outSprites, f));
  console.log(`copied ${pdFiles.length} paper-doll sheets -> public/sprites/pbo/paperdolls`);
} else {
  console.log(`game dir not found; using ${pdFiles.length} sheets already in public/`);
}
const pdHave = new Set(pdFiles.map((f) => f.slice(0, -4)));

// --- 2. Slot taxonomy + draw order (back -> front), inferred from PaperDollType ---
const SLOT_ORDER = ["AURA", "WINGS", "CAPE", "TAIL", "BACKPACK", "BODY", "SHOE", "PANTS", "SHIRT", "JACKET", "GLOVES", "OTHER", "FACE", "HAIR", "BEARD", "HOOD", "HAT", "CROWN", "HORNS", "MASK", "GLASSES", "BEAK", "HELD"];
function detectSlot(name) {
  const n = name.toLowerCase();
  if (/mask/.test(n)) return "MASK";
  if (/glasses|goggle|monocle|eyepatch|visor/.test(n)) return "GLASSES";
  if (/beard|mustache|moustache/.test(n)) return "BEARD";
  if (/\bhair\b|wig|ponytail|afro/.test(n)) return "HAIR";
  if (/\bface\b|makeup|\bscar\b|warpaint/.test(n)) return "FACE";
  if (/hood/.test(n)) return "HOOD";
  if (/crown|tiara/.test(n)) return "CROWN";
  if (/horns?|antlers/.test(n)) return "HORNS";
  if (/\bhat\b|cap\b|beanie|headband|bandana|\bears\b|halo|helmet|helm\b/.test(n)) return "HAT";
  if (/beak/.test(n)) return "BEAK";
  if (/wing/.test(n)) return "WINGS";
  if (/cape|cloak/.test(n)) return "CAPE";
  if (/backpack|\bbag\b/.test(n)) return "BACKPACK";
  if (/aura/.test(n)) return "AURA";
  if (/tail/.test(n)) return "TAIL";
  if (/glove|gauntlet|armlet|bracelet|\bclaws?\b|collar|scarf/.test(n)) return "GLOVES";
  if (/jacket|coat|cloak|robe|poncho/.test(n)) return "JACKET";
  if (/shirt|\btop\b|jersey|hoodie|sweater|dress|kimono|vest|suit|body/.test(n)) return "SHIRT";
  if (/pants|trouser|jeans|shorts|skirt|\blegs?\b/.test(n)) return "PANTS";
  if (/shoe|boot|sandal|\bfeet\b|slipper/.test(n)) return "SHOE";
  if (/sword|staff|wand|weapon|katana|scythe|spear|\baxe\b|shield|hammer/.test(n)) return "HELD";
  return "OTHER";
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

// --- 4. Catalog from items.csv ---
const rows = fs.readFileSync(path.join(cache, "item/items.csv"), "utf8").split(/\r?\n/);
const items = [];
const seen = new Set();
for (const ln of rows) {
  const c = ln.split(",");
  if (c[1] !== "Customisation") continue;
  const name = c[0], pid = c[6];
  if (!/^\d+$/.test(pid) || !pdHave.has(pid)) continue;
  const key = name + "|" + pid;
  if (seen.has(key)) continue;
  seen.add(key);
  const e = { name, pid, slot: detectSlot(name), gender: detectGender(name) };
  if (esMap.get(name)) e.es = esMap.get(name);
  if (ptMap.get(name)) e.pt = ptMap.get(name);
  if (zhMap.get(name)) e.zh = zhMap.get(name);
  items.push(e);
}
items.sort((a, b) => a.slot.localeCompare(b.slot) || a.name.localeCompare(b.name));

// --- 5. One-click presets (slot -> paper-doll id) ---
const presets = [
  { name: "Tanjiro", slots: { HAIR: "4995", FACE: "4991", SHIRT: "4992", JACKET: "4996", PANTS: "4994", SHOE: "4993", HELD: "4997", AURA: "4998" } },
  { name: "Eevee", slots: { HOOD: "764", SHIRT: "765", PANTS: "767", SHOE: "766", TAIL: "768" } },
  { name: "Stitch", slots: { MASK: "848", SHIRT: "850", PANTS: "849", SHOE: "851" } },
].filter((p) => Object.values(p.slots).every((id) => pdHave.has(id)));

const data = {
  bodies: ["1", "2", "3", "4"].filter((b) => pdHave.has(b)),
  slotOrder: SLOT_ORDER,
  items,
  presets,
};
fs.mkdirSync(path.dirname(outData), { recursive: true });
fs.writeFileSync(outData, JSON.stringify(data));
console.log(`dressup.json -> ${items.length} items, ${data.bodies.length} bodies, ${presets.length} presets`);
