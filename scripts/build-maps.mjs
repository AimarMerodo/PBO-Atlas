// Generate src/data/maps/<region>.json marker files by cross-referencing the
// game's maps.csv (world-map coordinates) with the scraped spawn locations.
//
// Source data: extract maps/maps.csv from the PBO game's pbo.jar into
// scripts/.cache/maps.csv. The world map images (750x450) come from
// assets/ui/world-map/<region>_world_map.png -> public/maps/<region>.png.
//
// Usage: node scripts/build-maps.mjs

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slugify } from "./lib/normalize.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CSV_FILE = path.join(ROOT, "scripts", ".cache", "maps.csv");
const SPAWNS_DIR = path.join(ROOT, "src", "data", "spawns");
const OUT_DIR = path.join(ROOT, "src", "data", "maps");

const IMAGE_W = 750;
const IMAGE_H = 450;

const REGIONS = { sinnoh: "SINNOH", jvaloh: "JVALOH", hoenn: "HOENN", kanto: "KANTO" };

// Forum location slug -> game CSV location slug, for names the heuristics
// can't bridge.
const ALIASES = {
  "route-5-a-b-c": "route-5-b",
  "mt-inferno": "mt-inferno-1",
  "gym-7": "gym-7-1f",
};

/**
 * Candidate lookup slugs for a forum location name, most specific first.
 * Interiors/floors ("Mt. Pyre 2F", "Seafloor Cavern (Room 3)") fall back to
 * their base location's world-map position.
 */
function candidateSlugs(name) {
  const seen = new Set();
  const out = [];
  const push = (n) => {
    const s = slugify(n);
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  push(name);
  const direct = ALIASES[slugify(name)];
  if (direct) push(direct);
  push(name.replace(/\s*\([^)]*\)\s*$/, "")); // drop trailing parenthetical
  push(name.split(/\s+[-–]\s+|:/)[0]); // before " - " or ":"

  // Progressively drop trailing floor/room-ish tokens: "1F", "B2F", "2-A",
  // "Floor", "Room", bare numbers/letters, "1F 2R"...
  let base = name.replace(/\s*\([^)]*\)\s*$/, "");
  for (let i = 0; i < 4; i++) {
    const next = base.replace(/[\s\-:#]*\b(b?\d+f?r?|floor|room|\d+(-[a-z])?|[a-z])\b\s*$/i, "").trim();
    if (next === base || next.length < 3) break;
    base = next;
    push(base);
  }
  return out;
}

function kindFor(name) {
  if (/\b(city|town|village)\b/i.test(name)) return "city";
  if (/\b(cave|cavern|mt\.|mount|tower|tunnel|forest|mine|gate|pillar|path|hollow|summit|peak|island|ruins|chamber)\b/i.test(name))
    return "dungeon";
  return "route";
}

let csv;
try {
  csv = await readFile(CSV_FILE, "utf8");
} catch {
  console.error(
    `Missing ${CSV_FILE}\n` +
      `Extract it from the game: pbo.jar -> maps/maps.csv (a .jar is a zip archive).`
  );
  process.exit(1);
}

// Rows: id,name,music,?,x,y,visible,region — name may contain commas, so
// take fixed fields from both ends.
const byRegion = {};
for (const line of csv.trim().split(/\r?\n/)) {
  const parts = line.split(",");
  if (parts.length < 8) continue;
  const region = parts[parts.length - 1].trim();
  const y = Number(parts[parts.length - 3]);
  const x = Number(parts[parts.length - 4]);
  const name = parts.slice(1, parts.length - 6).join(",").trim();
  // Interior maps are visible=FALSE but still carry their world position,
  // so the visibility flag is intentionally ignored.
  if (!Number.isFinite(x) || !Number.isFinite(y) || x <= 0 || y <= 0) continue;

  const slug = slugify(name);
  byRegion[region] ??= new Map();
  const bucket = byRegion[region];
  if (!bucket.has(slug)) bucket.set(slug, { name, xs: [], ys: [] });
  bucket.get(slug).xs.push(x);
  bucket.get(slug).ys.push(y);
}

await mkdir(OUT_DIR, { recursive: true });

for (const [regionId, csvRegion] of Object.entries(REGIONS)) {
  const spawns = JSON.parse(await readFile(path.join(SPAWNS_DIR, `${regionId}.json`), "utf8"));
  const gameLocations = byRegion[csvRegion] ?? new Map();

  const markers = [];
  const unmatched = [];
  for (const loc of spawns.locations) {
    let hit = null;
    for (const slug of candidateSlugs(loc.name)) {
      hit = gameLocations.get(slug);
      if (hit) break;
    }
    if (!hit) {
      unmatched.push(loc.name);
      continue;
    }
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    markers.push({
      locationId: loc.id,
      x: Math.round((avg(hit.xs) / IMAGE_W) * 1000) / 10,
      y: Math.round((avg(hit.ys) / IMAGE_H) * 1000) / 10,
      kind: kindFor(loc.name),
    });
  }

  // Spread markers that landed on the same spot (e.g. floors of one dungeon)
  // into a small ring so every one stays clickable.
  const groups = new Map();
  for (const m of markers) {
    const key = `${Math.round(m.x)}|${Math.round(m.y)}`;
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.forEach((m, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      m.x = Math.round((m.x + 1.3 * Math.cos(angle)) * 10) / 10;
      m.y = Math.round((m.y + 1.3 * Math.sin(angle)) * 10) / 10;
    });
  }

  const out = {
    region: regionId,
    image: `/maps/${regionId}.png`,
    imageWidth: IMAGE_W,
    imageHeight: IMAGE_H,
    markers,
  };
  await writeFile(path.join(OUT_DIR, `${regionId}.json`), JSON.stringify(out, null, 2), "utf8");
  console.log(
    `${regionId}: ${markers.length}/${spawns.locations.length} locations matched` +
      (unmatched.length ? ` | no marker for: ${unmatched.join(", ")}` : "")
  );
}
