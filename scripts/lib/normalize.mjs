// Normalizers for raw forum table cell values.
// Every parser is tolerant: on unrecognized input it returns null and the
// caller records a warning while keeping the raw value.

import { SLUG_OVERRIDES } from "./slug-overrides.mjs";

const RARITIES = {
  common: "common",
  uncommon: "uncommon",
  rare: "rare",
  "very rare": "very-rare",
  "very-rare": "very-rare",
  "ultra rare": "ultra-rare",
  "ultra-rare": "ultra-rare",
  legendary: "legendary",
};

const TIMES = {
  all: "all",
  day: "day",
  night: "night",
  "day/night": "all",
};

const METHOD_PREFIXES = [
  ["walk", "walking"],
  ["waking", "walking"], // forum typo (Jvaloh)
  ["surf", "surfing"],
  ["fish", "fishing"],
  ["headbutt", "headbutt"],
  ["rock smash", "rock-smash"],
  ["honey", "honey"],
  ["dig", "digging"],
];

const STAT_SYNONYMS = {
  hp: "hp",
  base_hp: "hp",
  "base hp": "hp",
  attack: "attack",
  atk: "attack",
  defense: "defense",
  defence: "defense",
  def: "defense",
  "sp_atk": "special-attack",
  "sp atk": "special-attack",
  "sp. atk": "special-attack",
  "sp.atk": "special-attack",
  spatk: "special-attack",
  spattack: "special-attack",
  "special attack": "special-attack",
  "special-attack": "special-attack",
  "sp_def": "special-defense",
  "sp def": "special-defense",
  "sp. def": "special-defense",
  "sp.def": "special-defense",
  spdef: "special-defense",
  spdefense: "special-defense",
  "special defense": "special-defense",
  "special-defense": "special-defense",
  speed: "speed",
  spd: "speed",
  spe: "speed",
};

const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();

export function parseRarity(raw) {
  return RARITIES[clean(raw).toLowerCase()] ?? null;
}

export function parseTime(raw) {
  return TIMES[clean(raw).toLowerCase()] ?? null;
}

export function parseMethod(raw) {
  const value = clean(raw).toLowerCase();
  if (!value) return null;
  for (const [prefix, method] of METHOD_PREFIXES) {
    if (value.startsWith(prefix)) {
      // Annotations like "Walking (UNCATCHABLE)" become a note.
      const note = clean(raw).replace(new RegExp(`^${prefix}\\w*`, "i"), "").replace(/[()]/g, "").trim();
      return { method, note: note || undefined };
    }
  }
  return null;
}

export function parseLevel(raw) {
  const value = clean(raw);
  const range = value.match(/(\d+)\s*(?:[-–—]|\s)\s*(\d+)/);
  if (range) {
    const [min, max] = [Number(range[1]), Number(range[2])].sort((a, b) => a - b);
    return { min, max };
  }
  const single = value.match(/^(\d+)$/);
  if (single) return { min: Number(single[1]), max: Number(single[1]) };
  return null;
}

/**
 * Parse EV yield strings. Two formats observed across threads:
 *   "1 SP_ATK"  /  "2 HP"            (amount first)
 *   "Attack: 3" /  "Sp. Atk: 1"      (stat first)
 * Multiple EVs may be separated by "," or "/".
 */
export function parseEvs(raw) {
  const value = clean(raw);
  if (!value) return null;
  const evs = [];

  if (value.includes(":")) {
    // "Attack: 3" / "Sp. Atk: 1, Speed: 2"
    for (const part of value.split(/[,/]| and /i).map((p) => p.trim()).filter(Boolean)) {
      const m = part.match(/^(.+?):\s*(\d+)$/);
      if (!m) return null;
      const stat = STAT_SYNONYMS[m[1].toLowerCase().trim()];
      if (!stat) return null;
      evs.push({ stat, amount: Number(m[2]) });
    }
    return evs.length ? evs : null;
  }

  // Amount-first pairs, possibly several in one cell with any separator:
  // "1 SP_ATK", "2 BASE_HP", "1 ATK 1 SP_ATK", "1 HP, 1 Speed"
  const pairRe = /(\d+)\s*([a-z_.]+(?:[ .]?[a-z_]+)?)/gi;
  let consumed = 0;
  let m;
  while ((m = pairRe.exec(value)) !== null) {
    const stat = STAT_SYNONYMS[m[2].toLowerCase().replace(/\.$/, "").trim()];
    if (!stat) return null;
    evs.push({ stat, amount: Number(m[1]) });
    consumed += m[0].length;
  }
  // Reject if most of the string wasn't pair-shaped (avoid false positives).
  if (!evs.length || consumed < value.replace(/[,/]|and/gi, "").trim().length * 0.6) return null;
  return evs;
}

/** Slugify any display name (pokemon or location) into a URL-safe id. */
export function slugify(name) {
  return clean(name)
    .toLowerCase()
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.'’:]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Map a forum pokemon display name to its PokeAPI slug. */
export function pokemonSlug(displayName) {
  const key = clean(displayName).toLowerCase();
  return SLUG_OVERRIDES[key] ?? slugify(displayName);
}
