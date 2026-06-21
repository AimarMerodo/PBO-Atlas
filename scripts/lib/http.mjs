// Polite HTTP fetching with on-disk caching for scraper scripts.
// Cached pages live in scripts/.cache/ so development re-runs never
// hit the forum or PokeAPI twice for the same URL.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CACHE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".cache");
const USER_AGENT =
  "PBOAPP-scraper/0.1 (community fan tool for Pokemon Blaze Online; respectful one-time scrape)";

const DELAY_MS = 500;
let lastFetchAt = 0;

function cachePath(url, subdir = "html") {
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 16);
  // Keep a recognizable slug in the filename for manual cache drops.
  const slug = url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return path.join(CACHE_DIR, subdir, `${slug}.${hash}.txt`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch a URL as text, using the disk cache when available.
 * If the network fetch fails (e.g. Cloudflare challenge), the error message
 * tells the user where to manually save the page HTML so the parser can
 * read it from cache transparently.
 */
export async function fetchText(url, { subdir = "html", delayMs = DELAY_MS } = {}) {
  const file = cachePath(url, subdir);
  try {
    return await readFile(file, "utf8");
  } catch {
    // cache miss — fall through to network
  }

  const wait = lastFetchAt + delayMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastFetchAt = Date.now();

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} fetching ${url}`);
    err.status = res.status;
    err.cacheFile = file;
    throw err;
  }
  const text = await res.text();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text, "utf8");
  return text;
}
