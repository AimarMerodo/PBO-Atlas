// Scrape the official PBO forum spawn megathreads into src/data/spawns/*.json
// Usage: node scripts/scrape-spawns.mjs [sinnoh|jvaloh|hoenn|kanto|all]

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchThreadPages, collectOpPosts, extractLocationTables } from "./lib/xenforo.mjs";
import { parseRarity, parseTime, parseMethod, parseLevel, parseEvs, slugify, pokemonSlug } from "./lib/normalize.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "data", "spawns");

const REGIONS = {
  sinnoh: {
    name: "Sinnoh",
    threadUrl: "https://forums.pokemonblazeonline.com/threads/sinnoh-pokemon-spawns-and-locations.875/",
  },
  jvaloh: {
    name: "Jvaloh",
    threadUrl: "https://forums.pokemonblazeonline.com/threads/jvaloh-spawns-locations.1451/",
  },
  hoenn: {
    name: "Hoenn",
    threadUrl: "https://forums.pokemonblazeonline.com/threads/hoenn-pokemon-spawns-and-locations.2136/",
  },
  kanto: {
    name: "Kanto",
    threadUrl: "https://forums.pokemonblazeonline.com/threads/kanto-spawnlist.2548/",
  },
};

function normalizeRow(raw, warnings, context) {
  const displayName = raw.pokemon;
  const rarity = parseRarity(raw.rarity);
  const time = parseTime(raw.time);
  const methodParsed = parseMethod(raw.method);
  const level = parseLevel(raw.level);
  const evs = raw.ev ? parseEvs(raw.ev) : null;

  if (!rarity) warnings.push(`${context}: unknown rarity "${raw.rarity}" (${displayName})`);
  if (!time) warnings.push(`${context}: unknown time "${raw.time}" (${displayName})`);
  if (!methodParsed) warnings.push(`${context}: unknown method "${raw.method}" (${displayName})`);
  if (!level) warnings.push(`${context}: unparsed level "${raw.level}" (${displayName})`);
  if (raw.ev && !evs) warnings.push(`${context}: unparsed EV "${raw.ev}" (${displayName})`);

  return {
    pokemon: pokemonSlug(displayName),
    displayName,
    rarity: rarity ?? raw.rarity?.toLowerCase() ?? "unknown",
    time: time ?? "all",
    method: methodParsed?.method ?? raw.method?.toLowerCase() ?? "unknown",
    ...(methodParsed?.note ? { methodNote: methodParsed.note } : {}),
    level: level ?? null,
    evs: evs ?? [],
    raw,
  };
}

async function scrapeRegion(regionId) {
  const region = REGIONS[regionId];
  console.log(`\n=== ${region.name} ===`);
  console.log(`Fetching ${region.threadUrl}`);

  const docs = await fetchThreadPages(region.threadUrl);
  console.log(`  ${docs.length} page(s)`);

  const { opAuthor, bodies } = collectOpPosts(docs);
  console.log(`  OP author: ${opAuthor}, ${bodies.length} OP post(s)`);

  const { locations: rawLocations, warnings } = extractLocationTables({ bodies });

  const locations = [];
  for (const [heading, rows] of rawLocations) {
    const spawns = rows.map((raw) => normalizeRow(raw, warnings, `${heading}`));
    locations.push({ id: slugify(heading), name: heading, spawns });
  }

  const output = {
    region: regionId,
    name: region.name,
    sourceUrl: region.threadUrl,
    scrapedAt: new Date().toISOString(),
    locations,
  };

  await mkdir(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `${regionId}.json`);
  await writeFile(outFile, JSON.stringify(output, null, 2), "utf8");

  const spawnCount = locations.reduce((n, l) => n + l.spawns.length, 0);
  console.log(`  -> ${locations.length} locations, ${spawnCount} spawn rows -> ${path.relative(ROOT, outFile)}`);
  if (warnings.length) {
    console.log(`  ${warnings.length} warning(s):`);
    for (const w of warnings.slice(0, 40)) console.log(`    - ${w}`);
    if (warnings.length > 40) console.log(`    ... and ${warnings.length - 40} more`);
  }
  return { locations: locations.length, spawns: spawnCount, warnings: warnings.length };
}

const target = process.argv[2] ?? "all";
const targets = target === "all" ? Object.keys(REGIONS) : [target];

if (targets.some((t) => !REGIONS[t])) {
  console.error(`Unknown region "${target}". Valid: ${Object.keys(REGIONS).join(", ")}, all`);
  process.exit(1);
}

const summary = {};
for (const regionId of targets) {
  try {
    summary[regionId] = await scrapeRegion(regionId);
  } catch (err) {
    console.error(`FAILED ${regionId}: ${err.message}`);
    if (err.cacheFile) {
      console.error(
        `  If the forum blocks scripted fetches, open the thread in a browser,\n` +
          `  save the full page HTML to: ${err.cacheFile}\n` +
          `  and re-run this script (it reads the cache transparently).`
      );
    }
    process.exitCode = 1;
  }
}

console.log(`\nSummary: ${JSON.stringify(summary, null, 2)}`);
