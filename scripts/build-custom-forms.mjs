// Inject PBO custom event-sprite forms (Halloween/Christmas/Easter/Summer/Valentine)
// into pokedex.json as their own entries. They are the SAME pokemon as their base —
// stats/types/abilities/EVs/flavor are cloned; only the sprite (and name/slug/id) differ.
// Source: public/sprites/pbo/custom/index.json (event, name, base, sprite, dex numbers).
//
// Runs after build-pokedex (so the base entries + evolution lines exist) and before
// search-index/page-data. Idempotent: previously-injected entries (those with an
// `event` field) are dropped and rebuilt each run.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugify = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const pokedex = JSON.parse(await readFile(path.join(ROOT, "data/pokedex.json"), "utf8"));
const index = JSON.parse(await readFile(path.join(ROOT, "public/sprites/pbo/custom/index.json"), "utf8"));

// idempotent: drop previously-injected custom entries
for (const [slug, e] of Object.entries(pokedex)) if (e.event) delete pokedex[slug];

// Some index bases are dashless form names ("gardevoirmega" → "gardevoir-mega").
const byDashless = new Map(Object.keys(pokedex).map((s) => [s.replace(/-/g, ""), s]));
const resolveBase = (b) => (pokedex[b] ? b : (byDashless.get(b) ?? b));

// Stable order: by PBO dex number, then name. Assign ids well above the form range
// (mega/gmax sit at 10000-10325) so custom forms group at the very end of the dex.
const forms = [...index]
  .map((e) => ({ ...e, slug: slugify(e.name), baseSlug: resolveBase(e.base) }))
  .sort((a, b) => (a.pokedexNumber || 0) - (b.pokedexNumber || 0) || a.name.localeCompare(b.name));

// `${event}:${baseSlug}` -> the custom form covering that stage in that event
const byStage = new Map(forms.map((e) => [`${e.event}:${e.baseSlug}`, { slug: e.slug, name: e.name }]));

const warnings = [];
let i = 0;
for (const e of forms) {
  const base = pokedex[e.baseSlug];
  if (!base) {
    warnings.push(`no base "${e.base}" for ${e.name}`);
    continue;
  }
  // Evolution line = base's line restricted to the stages that also got a custom
  // sprite this event. Only kept when it forms a real chain (>1 stage).
  const evoLine = (base.evolutionLine ?? [])
    .map((m) => {
      const c = byStage.get(`${e.event}:${m.slug}`);
      return c ? { slug: c.slug, name: c.name, ...(m.trigger ? { trigger: m.trigger } : {}) } : null;
    })
    .filter(Boolean);

  pokedex[e.slug] = {
    id: 20001 + i,
    speciesId: 20001 + i,
    slug: e.slug,
    name: e.name,
    types: base.types,
    stats: base.stats,
    abilities: base.abilities,
    heightM: base.heightM,
    weightKg: base.weightKg,
    generation: base.generation,
    sprite: e.sprite,
    spriteShiny: null,
    artwork: null,
    artworkShiny: null,
    spritePbo: e.sprite,
    spritePboShiny: null,
    evYield: base.evYield,
    flavor: base.flavor ?? null,
    flavorEs: base.flavorEs ?? null,
    flavorZh: base.flavorZh ?? null,
    evolutionLine: evoLine.length > 1 ? evoLine : [],
    event: e.event,
    customBase: e.baseSlug,
  };
  i++;
}

await writeFile(path.join(ROOT, "data/pokedex.json"), JSON.stringify(pokedex), "utf8");
console.log(`custom-forms: +${i} event forms injected${warnings.length ? ` (${warnings.length} skipped)` : ""}`);
for (const w of warnings.slice(0, 10)) console.warn(`  ⚠ ${w}`);
