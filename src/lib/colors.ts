// Color maps for pokemon types and spawn rarities (Tailwind-free hex values
// used as inline styles / CSS variables so badges stay data-driven).

export const TYPE_COLORS: Record<string, string> = {
  normal: "#9099a1",
  fire: "#ff9c54",
  water: "#4d90d5",
  grass: "#63bb5b",
  electric: "#f3d23b",
  ice: "#74cec0",
  fighting: "#ce4069",
  poison: "#ab6ac8",
  ground: "#d97746",
  flying: "#8fa8dd",
  psychic: "#f97176",
  bug: "#90c12c",
  rock: "#c7b78b",
  ghost: "#5269ac",
  dragon: "#0a6dc4",
  dark: "#5a5366",
  steel: "#5a8ea1",
  fairy: "#ec8fe6",
};

export const RARITY_COLORS: Record<string, string> = {
  common: "#9099a1",
  uncommon: "#63bb5b",
  rare: "#4d90d5",
  "very-rare": "#ab6ac8",
  "ultra-rare": "#ff9c54",
  legendary: "#f3d23b",
};

export const RARITY_ORDER: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  "very-rare": 3,
  "ultra-rare": 4,
  legendary: 5,
};
