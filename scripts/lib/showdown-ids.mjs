// Map PokeAPI slugs to Showdown-style ids (used by the game's pokemondata
// and its sprite filenames): lowercase, no dashes, default forms unsuffixed.

// PokeAPI default-form slug -> showdown id, for forms where stripping dashes
// is not enough because showdown drops the default-form suffix entirely.
const DEFAULT_FORM_ALIASES = {
  "basculin-red-striped": "basculin",
  "deoxys-normal": "deoxys",
  "giratina-altered": "giratina",
  "shaymin-land": "shaymin",
  "wormadam-plant": "wormadam",
  "darmanitan-standard": "darmanitan",
  "meloetta-aria": "meloetta",
  "keldeo-ordinary": "keldeo",
  "tornadus-incarnate": "tornadus",
  "thundurus-incarnate": "thundurus",
  "landorus-incarnate": "landorus",
  "enamorus-incarnate": "enamorus",
  "urshifu-single-strike": "urshifu",
  "zygarde-50": "zygarde",
  "oricorio-baile": "oricorio",
  "lycanroc-midday": "lycanroc",
  "wishiwashi-solo": "wishiwashi",
  "minior-red-meteor": "minior",
  "mimikyu-disguised": "mimikyu",
  "toxtricity-amped": "toxtricity",
  "eiscue-ice": "eiscue",
  "indeedee-male": "indeedee",
  "morpeko-full-belly": "morpeko",
  "basculegion-male": "basculegion",
  "aegislash-shield": "aegislash",
  "pumpkaboo-average": "pumpkaboo",
  "gourgeist-average": "gourgeist",
  "meowstic-male": "meowstic",
  "maushold-family-of-four": "maushold",
  "squawkabilly-green-plumage": "squawkabilly",
  "palafin-zero": "palafin",
  "tatsugiri-curly": "tatsugiri",
  "dudunsparce-two-segment": "dudunsparce",
  "oinkologne-male": "oinkologne",
  "frillish-male": "frillish",
  "tauros-paldea-combat-breed": "taurospaldeacombat",
  "tauros-paldea-blaze-breed": "taurospaldeablaze",
  "tauros-paldea-aqua-breed": "taurospaldeaaqua",
};

const dashless = (slug) => slug.replace(/-/g, "");

/** Candidate showdown ids for a PokeAPI slug, most specific first. */
export function showdownCandidates(slug) {
  const out = [];
  if (DEFAULT_FORM_ALIASES[slug]) out.push(DEFAULT_FORM_ALIASES[slug]);
  out.push(dashless(slug));
  // Mega/regional suffix conventions match after dash removal
  // (charizard-mega-x -> charizardmegax, voltorb-hisui -> voltorbhisui).
  return [...new Set(out)];
}

export { dashless };
