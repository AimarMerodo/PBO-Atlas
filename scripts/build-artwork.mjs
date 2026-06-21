// Self-host the official PokeAPI artwork: download each official-artwork/<id>.png,
// resize to 400px + convert to WebP (≈190KB→~25KB, visually identical at the sizes we
// render), save to public/art/pokemon/<id>.webp, and rewrite the github URLs in the
// served JSON to the local path. Idempotent: existing webp are skipped, so re-running
// only fills gaps. Run after build-page-data (added to the `data` npm script).
//
// Needs cwebp on PATH (brew install webp). ponytail: uses cwebp + node fetch, no new npm dep.
import { readFile, writeFile, mkdir, readdir, access, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const exec = promisify(execFile);
const CWEBP = process.env.CWEBP || "cwebp";
const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "public", "data");
const OUT_DIR = join(ROOT, "public", "art", "pokemon");
const TMP_DIR = join(OUT_DIR, ".tmp");
const SIZE = 400; // official art is 475px; 400 covers the 130px grid + 200px detail at 2x
const QUALITY = 80;
const CONCURRENCY = 20;

// Matches https://raw.githubusercontent.com/PokeAPI/sprites/.../official-artwork/<id>.png
const ART_RE = /https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/[^"\s]*?\/official-artwork\/(\d+)\.png/g;
const localFor = (id) => `/art/pokemon/${id}.webp`;

const exists = async (p) => {
  try { await access(p); return true; } catch { return false; }
};

// Recursively list every .json under public/data
async function jsonFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await jsonFiles(p)));
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}

async function convertOne(id, attempt = 1) {
  const out = join(OUT_DIR, `${id}.webp`);
  if (await exists(out)) return "skip";
  const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tmp = join(TMP_DIR, `${id}.png`);
    await writeFile(tmp, Buffer.from(await res.arrayBuffer()));
    await exec(CWEBP, ["-quiet", "-resize", String(SIZE), "0", "-q", String(QUALITY), tmp, "-o", out]);
    await rm(tmp, { force: true });
    return "done";
  } catch (e) {
    if (attempt < 3) { await new Promise((r) => setTimeout(r, 400 * attempt)); return convertOne(id, attempt + 1); }
    console.error(`  fail #${id}: ${e.message}`);
    return "fail";
  }
}

async function run(ids) {
  const stats = { done: 0, skip: 0, fail: 0 };
  let i = 0;
  async function worker() {
    while (i < ids.length) {
      const id = ids[i++];
      const r = await convertOne(id);
      stats[r]++;
      const n = stats.done + stats.skip + stats.fail;
      if (n % 100 === 0) console.log(`  ${n}/${ids.length} (done ${stats.done}, skip ${stats.skip}, fail ${stats.fail})`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return stats;
}

async function main() {
  await mkdir(TMP_DIR, { recursive: true });
  const files = await jsonFiles(DATA_DIR);

  // collect every official-artwork id referenced anywhere in the served data
  const ids = new Set();
  const touched = [];
  for (const f of files) {
    const txt = await readFile(f, "utf8");
    let hit = false;
    for (const m of txt.matchAll(ART_RE)) { ids.add(m[1]); hit = true; }
    if (hit) touched.push(f);
  }
  console.log(`Found ${ids.size} unique artwork ids across ${touched.length} json files.`);

  const stats = await run([...ids]);
  console.log(`Images: done ${stats.done}, skipped ${stats.skip}, failed ${stats.fail}.`);

  // rewrite the github URLs -> local webp, but only for ids whose webp actually exists on
  // disk (a failed download keeps its github URL, so no broken image / 404 in the grid).
  const available = new Set();
  for (const id of ids) if (await exists(join(OUT_DIR, `${id}.webp`))) available.add(id);
  let rewritten = 0;
  for (const f of touched) {
    const txt = await readFile(f, "utf8");
    let changed = false;
    const next = txt.replace(ART_RE, (full, id) => {
      if (!available.has(id)) return full;
      changed = true;
      return localFor(id);
    });
    if (changed && next !== txt) { await writeFile(f, next); rewritten++; }
  }
  console.log(`Rewrote artwork URLs in ${rewritten} json files -> ${localFor("<id>")}.`);
  await rm(TMP_DIR, { recursive: true, force: true });
}

main().catch((e) => { console.error(e); process.exit(1); });
