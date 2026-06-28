// "Where to get" item-source data, hand-curated from the official PBO forum
// guide threads. Consumed by build-item-sources.mjs, which resolves the display
// names to item slugs (see ITEM_ALIASES) and validates against items.json.
//
// Forum sources:
//   #1744 Wild Drops · #1760 Items & Shops Overview · #2163 Mega stone shops
//   #2140 Mining/Cosmog · #2385 Pickaxe Crafting · #5742 Crafting
//   #3326 New Fishing (Nov 2025) · #2256 Legendary Caverns/Lake Trio
//   Regi bosses (Sage Eron) · VS Seeker · Item Bomb · Bug/Fish Contests
//   Gamepass chests · Halloween/Easter/Summer events
//
// TMs/TRs are intentionally excluded (our items.json TMs are generic TM00..TM100
// with no move names, so PBO's numbered+named TMs can't be matched usefully).

// Item display names that don't match an items.json name verbatim → slug.
export const ITEM_ALIASES = {
  "amber fossil": "old-amber",
  "petaled coral": "petalized-coral",
  "sooth sash exp share blueprint": "soothe-share-blueprint",
  "air balloon": "one-time-air-balloon",
  "focus sash": "one-time-focus-sash",
  "deep sea tooth": "deepseatooth",
  "deep sea scale": "deepseascale",
};

// --- Wild Pokémon drops (held/evo items #1744 + crafting materials #5742) ---
// d(item, pokemon, regions[], detail?)
const d = (item, pokemon, regions, detail) => ({ item, method: "drop", pokemon, regions, detail });
export const DROPS = [
  // Held items
  d("black-belt", "Sawk", ["Hoenn"]),
  d("black-belt", "Meditite", ["Sinnoh", "Jvaloh"]),
  d("charcoal", "Vulpix", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("charcoal", "Torkoal", ["Sinnoh", "Hoenn"]),
  d("dragon-fang", "Gible", ["Sinnoh"]),
  d("expert-belt", "Pinsir", ["Sinnoh"]),
  d("hard-stone", "Onix", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("magnet", "Magnemite", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("miracle-seed", "Fomantis", ["Jvaloh"]),
  d("mystic-water", "Frillish", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("mystic-water", "Pelipper", ["Hoenn"]),
  d("never-melt-ice", "Cryogonal", ["Jvaloh", "Hoenn"]),
  d("never-melt-ice", "Jynx", ["Sinnoh"]),
  d("poison-barb", "Qwilfish", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("poison-barb", "Skorupi", ["Sinnoh"]),
  d("sharp-beak", "Starly", ["Sinnoh"]),
  d("silk-scarf", "Lickitung", ["Hoenn"]),
  d("silk-scarf", "Kangaskhan", ["Jvaloh"]),
  d("silver-powder", "Dustox", ["Sinnoh"]),
  d("soft-sand", "Diglett", ["Jvaloh", "Hoenn"]),
  d("soft-sand", "Sandslash", ["Sinnoh"]),
  d("spell-tag", "Misdreavus", ["Sinnoh"]),
  d("twisted-spoon", "Abra", ["Jvaloh"]),
  d("twisted-spoon", "Kadabra", ["Sinnoh"]),
  d("black-glasses", "Sandile", ["Sinnoh"]),
  d("leek", "Farfetch'd-Galar", ["Jvaloh"]),
  // Evolution items
  d("electirizer", "Elekid", ["Sinnoh"]),
  d("magmarizer", "Magby", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("razor-fang", "Gligar", ["Sinnoh"]),
  d("auspicious-armor", "Charcadet", ["Hoenn"]),
  d("malicious-armor", "Charcadet", ["Hoenn"]),
  d("kings-rock", "Politoed", ["Hoenn"]),
  d("kings-rock", "Slowpoke", ["Sinnoh"]),
  d("galarica-cuff", "Slowpoke-Galar", ["Hoenn"]),
  d("galarica-wreath", "Slowpoke-Galar", ["Hoenn"]),
  d("prism-scale", "Feebas", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("razor-claw", "Sneasel", ["Sinnoh", "Jvaloh"]),
  d("reaper-cloth", "Duskull", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("deepseatooth", "Clamperl", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("deepseascale", "Clamperl", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("protector", "Rhyhorn", ["Sinnoh"]),
  d("metal-coat", "Scyther", ["Sinnoh"]),
  d("metal-coat", "Onix", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("metal-coat", "Beldum", ["Hoenn"]),
  d("dragon-scale", "Horsea", ["Sinnoh", "Hoenn"]),
  d("oval-stone", "Chansey", ["Sinnoh"]),
  d("oval-stone", "Happiny", ["Jvaloh"]),
  // Evolution stones
  d("moon-stone", "Clefairy", ["Sinnoh"]),
  d("dawn-stone", "Kirlia", ["Sinnoh", "Jvaloh"]),
  d("water-stone", "Staryu", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("fire-stone", "Vulpix", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("sun-stone", "Helioptile", ["Sinnoh"]),
  d("dusk-stone", "Murkrow", ["Sinnoh"]),
  d("thunder-stone", "Magnemite", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("thunder-stone", "Pichu", ["Sinnoh"]),
  d("leaf-stone", "Seedot", ["Sinnoh", "Hoenn"]),
  d("leaf-stone", "Gloom", ["Hoenn"]),
  d("shiny-stone", "Roselia", ["Sinnoh"]),
  // Mega stones
  d("mawilite", "Mawile", ["Hoenn"]),
  d("aggronite", "Aron", ["Hoenn"]),
  d("manectite", "Electrike", ["Sinnoh"]),
  d("garchompite", "Gible", ["Sinnoh"], "Wayward Cave 2F"),
  d("sharpedonite", "Carvanha", ["Sinnoh"], "Route 222"),
  d("metagrossite-essence", "Relicanth", ["Hoenn"], "Route 126"),
  d("metagrossite-crest", "Tatsugiri", ["Hoenn"], "Meteor Falls"),
  // Misc
  d("heart-scale", "Luvdisc", ["Sinnoh", "Jvaloh", "Hoenn"]),
  d("stardust", "Staryu", ["Hoenn"]),
  d("star-piece", "Staryu", ["Hoenn"]),
  // Crafting materials dropped by wild pokemon (#5742)
  d("honey", "Combee", ["Sinnoh"], "crafting material"),
  d("fairy-feather", "Marill", ["Sinnoh", "Jvaloh", "Hoenn"], "crafting material"),
  d("fairy-feather", "Ralts", ["Sinnoh", "Jvaloh"], "crafting material"),
  d("tiny-mushroom", "Paras", ["Jvaloh"]),
  d("big-mushroom", "Parasect", ["Jvaloh"]),
  d("prehistoric-jawbone-shard", "Aerodactyl", [], "Aerodactylite fragment"),
  // Pickaxe-craft fossil materials (dropped by the revived fossil pokemon)
  d("fossilized-carapace", "Anorith", [], "Gold Pickaxe material"),
  d("petaled-coral", "Lileep", [], "Gold Pickaxe material"),
  d("shell-plate-fragment", "Tirtouga", [], "Gold Pickaxe material"),
  d("fossilized-crest", "Shieldon", [], "Platinum Pickaxe material"),
  d("ancient-wing-fragment", "Archen", [], "Platinum Pickaxe material"),
  d("glacial-crest-shard", "Amaura", [], "Platinum Pickaxe material"),
  d("oceanic-fossil-residue", "Kabuto", [], "Diamond Pickaxe material"),
  d("spiral-shell-fragment", "Omanyte", [], "Diamond Pickaxe material"),
  d("reptilian-fang", "Tyrunt", [], "Diamond Pickaxe material"),
  d("rampaging-jawbone", "Cranidos", [], "Diamond Pickaxe material"),
];

// Generic (non-drop) sources: g(method, source, items[, detailFn]).
const g = (method, source, rows) => rows.map((r) => (Array.isArray(r) ? { item: r[0], method, source, detail: r[1] } : { item: r, method, source }));

// --- Mining (#2140, #1909) — fossils, ore-tier money mats, Sun Core ---
export const MINE = [
  ...g("mine", "Mining (Fossil Maniac)", [
    ["claw-fossil", "Revives into Anorith"], ["root-fossil", "Revives into Lileep"],
    ["cover-fossil", "Revives into Tirtouga"], ["armor-fossil", "Revives into Shieldon"],
    ["plume-fossil", "Revives into Archen"], ["sail-fossil", "Revives into Amaura"],
    ["skull-fossil", "Revives into Cranidos"], ["helix-fossil", "Revives into Omanyte"],
    ["dome-fossil", "Revives into Kabuto"], ["old-amber", "Revives into Aerodactyl"],
    ["fossilized-fish", "Galar fossil part"], ["fossilized-drake", "Galar fossil part"],
    ["fossilized-bird", "Galar fossil part"], ["fossilized-dino", "Galar fossil part"],
  ]),
  ...g("mine", "Mining (Origin Ore)", [
    ["pearl", "money item"], ["big-pearl", "money item"], ["pearl-string", "money item"],
    ["nugget", "money item"], ["big-nugget", "money item"], ["star-piece", "money item"],
    ["comet-shard", "high tier"], ["heart-scale", ""], ["ability-patch", "legendary tier"],
    ["ability-capsule", "high tier"], ["sun-core", "legendary tier — Necrozma fusion material"],
  ]),
  // Dark Ore (highest tier) — legendary fusion cores (#3794 Fusing Legendaries)
  ...g("mine", "Mining (Dark Ore, legendary)", [
    ["prismatic-core", "Necrozma-Ultra fusion material"], ["moon-core", "N-Lunarizer material"],
  ]),
];

// --- Crafting (#5742, #2385, #3794) — fusion items, pickaxes, rods ---
export const CRAFT = [
  ...g("craft", "Pickaxe Guru House (Route 111)", [["gold-pickaxe"], ["platinum-pickaxe"], ["diamond-pickaxe"]]),
  ...g("craft", "Crafting (Fishing)", [["mythic-rod", "Lvl 100"], ["aether-rod", "Lvl 125"]]),
  ...g("craft", "Crafting (Crafter Hale)", [
    ["prism-casing", "5 Comet Shards + 2 Stardust + 2 Everstone"],
    ["n-solarizer", "75K F + Prism Casing + Sun Core + 4 Star Pieces (Necrozma Dusk Mane)"],
    ["n-lunarizer", "75K F + Prism Casing + Moon Core + 4 Comet Shards + 2 Star Pieces (Necrozma Dawn Wings)"],
  ]),
  ...g("craft", "Fusion Master (Cinnabar Island)", [["frozen-fusion-pack", "Kyurem fusion"], ["fusion-flare-pack", "Kyurem fusion"]]),
];

// --- Fishing (#3326) — treasure-chest loot, level rewards, rod chain ---
export const FISH = [
  ...g("fish", "Fishing level reward", [
    ["good-rod", "Lvl 30"], ["prism-scale", "Lvl 20"], ["mystic-water", "Lvl 30"],
    ["abyssal-pearl", "Lvl 60 — Finn's Shop currency"], ["ability-patch", "Lvl 80"], ["mythic-bait", "Lvl 85"],
  ]),
  ...g("fish", "Fishing treasure chest", [
    ["dratini-scale", "legendary tier"], ["icicle-plate", "Mythic Rod material"],
    ["splash-plate", "Aether Rod material"], ["comet-shard", "high tier"], ["ability-capsule", "high tier"],
    ["basic-bait", ""], ["enhanced-bait", ""],
  ]),
  ...g("fish", "Fisherman's Shop", [
    ["super-rod", "75K F"], ["mythic-rod-blueprint", "200K F (reusable)"], ["aether-rod-blueprint", "350K F (reusable)"], ["basic-bait", "5K F"],
  ]),
];

// --- Bosses — crafting cores + distinctive drops ---
export const BOSS = [
  ...g("boss", "Lake Trio bosses", [["emotion-core"], ["will-core"], ["knowledge-core"]]),
  ...g("boss", "Regi bosses (Sage Eron)", [["steel-core"], ["rock-core"], ["ice-core"]]),
  ...g("boss", "Regidrago", [["dragon-core"]]),
  ...g("boss", "Regice", [["ice-stone"], ["icicle-plate"]]),
  ...g("boss", "Registeel", [["metal-coat"], ["iron-plate"], ["metal-alloy"]]),
  ...g("boss", "Regirock", [["protector"], ["stone-plate"]]),
  ...g("boss", "Tyrantrum (Route 111 NPC)", [["metagrossite-core", "x3 for Metagrossite"]]),
];

// Hidden Power Shards (all 18 types) — Saffron City Fighting Dojo (#2708).
const HP_TYPES = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];

// --- Legendary Caverns / Lake Trio reward pool (#2256) ---
export const REWARD = [
  ...g("reward", "Legendary Caverns (Lake Trio)", [
    ["twisted-spoon"], ["mind-plate"], ["wise-glasses"], ["permanent-room-service"],
  ]),
  // VS Seeker rebattle drops
  ...g("reward", "VS Seeker", [
    ["kings-rock"], ["utility-umbrella"], ["life-orb"], ["one-time-air-balloon"], ["one-time-focus-sash"],
    ["hp-up"], ["protein"], ["carbos"], ["zinc"], ["calcium"], ["iron"],
  ]),
  // Item Bomb tiered pool
  ...g("reward", "Item Bomb", [
    ["punching-glove", "legendary tier"], ["expert-belt", "high tier"], ["quick-claw", "high tier"],
    ["malicious-armor", "high tier"], ["auspicious-armor", "high tier"], ["shiny-stone"], ["moon-stone"], ["zoom-lens"],
  ]),
  // Contests (mega stones + evolution items)
  ...g("reward", "Bug Catching Contest", [["scizorite", "Rank 1 (rare)"]]),
  ...g("reward", "Fishing Contest", [
    ["slowbronite", "Top 5 (rare)"], ["deepseatooth"], ["deepseascale"], ["dragon-scale"],
  ]),
  // Starter tools (quest/unlock rewards)
  ...g("reward", "Mining unlock (Lavaridge)", [["bronze-pickaxe", "starter pickaxe"]]),
  ...g("reward", "Fishing Guide quest (Jubilife)", [["old-rod", "starter rod"]]),
  // Aerodactylite quest fragments (#2309, #3061)
  ...g("reward", "Route 111 (trade Lileep/Anorith)", [["fossilized-talon-segment", "Aerodactylite fragment"]]),
  ...g("reward", "NPC north of Mauville (Lv100 Swellow)", [["aero-wing-fragment", "Aerodactylite fragment"]]),
  ...g("reward", "Marina, Route 111 (Mining Lv40)", [["ancient-rib-fragment", "Aerodactylite fragment"]]),
  // Hidden Power Shards — pick one of 4 weekly types from the Saffron Dojo apprentices
  ...HP_TYPES.map((t) => ({ item: `hidden-power-shard-${t}`, method: "reward", source: "Fighting Dojo (Saffron City)", detail: "4 Apprentices daily — weekly type rotation" })),
];

// --- Gamepass / random chests ---
export const CHEST = [
  ...g("chest", "Evolution Stone Chest", [
    ["razor-fang", "14%"], ["razor-claw", "14%"], ["metal-coat", "14%"],
    ["dusk-stone", "14%"], ["dawn-stone", "14%"], ["shiny-stone", "14%"], ["moon-stone", "14%"],
  ]),
  ...g("chest", "Gold Blaze Chest", [["ability-capsule", "20%"], ["rare-candy", "20%"], ["pp-up", "20%"]]),
];

// --- Seasonal events (date-gated; detail notes the season) ---
export const EVENT = [
  ...g("event", "Easter event", [
    ["lopunnite", "10,000 Egg Shards (Mega Stone)"], ["sweet-apple", "150 Egg Shards"],
    ["tart-apple", "150 Egg Shards"], ["syrupy-apple", "200 Egg Shards"],
    ["cocoa-stone", "250 Egg Shards"], ["petal-egg-stone", "250 Egg Shards"],
    ["douse-drive", "250 Egg Shards"], ["shock-drive", "250 Egg Shards"],
    ["burn-drive", "250 Egg Shards"], ["chill-drive", "250 Egg Shards"], ["gracidea", "1,000 Egg Shards"],
  ]),
  ...g("event", "Halloween event", [["houndoominite", "boss reward (Mega Stone)"], ["banettite", "boss reward (Mega Stone)"], ["gengarite", "Chamunda Hard (Mega Stone)"]]),
  ...g("event", "Summer event", [["soul-dew", "Aquara Sage Hard"], ["flame-orb", "Pyros Sage Hard"], ["grassy-seed", "Sylvaris Sage Hard"]]),
  ...g("event", "Valentine event", [["heart-petals", "event currency"], ["petal-dust", "quest drop"], ["corrupted-petal", "Corrupted Roserade boss"]]),
];

// --- Token / coin shops (notable items only) ---
export const SHOPS = [
  ...g("shop", "Dynite Ore Store", [
    ["permanent-air-balloon", "300 Ores"], ["metronome", "400 Ores"], ["macho-brace", "500 Ores"], ["exp-share", "400 Ores"],
    ["light-clay", "300 Ores"], ["terrain-extender", "200 Ores"], ["ability-patch", "125 Ores"], ["iv-randomizer", "75 Ores"],
    ["ability-capsule", "60 Ores"], ["grassy-seed", "200 Ores"], ["electric-seed", "200 Ores"], ["psychic-seed", "200 Ores"],
    ["misty-seed", "200 Ores"], ["charizardite-x", "3,000 Ores"], ["red-card", "300 Ores"], ["eject-pack", "300 Ores"], ["shell-bell", "40 Ores"],
  ]),
  ...g("shop", "Crew Wars Token Shop", [
    ["medichamite", "2,500 Tokens"], ["life-orb", "800 Tokens"], ["assault-vest", "800 Tokens"], ["leftovers", "800 Tokens"], ["eviolite", "800 Tokens"],
    ["rocky-helmet", "600 Tokens"], ["wise-glasses", "200 Tokens"], ["muscle-band", "200 Tokens"],
    ["damp-rock", "300 Tokens"], ["icy-rock", "300 Tokens"], ["heat-rock", "300 Tokens"], ["smooth-rock", "300 Tokens"],
    ["egg-move-voucher", "40 Tokens"], ["tutor-move-voucher", "40 Tokens"],
  ]),
  ...g("shop", "Blaze Coin Shop", [
    ["choice-scarf", "150 Coins"], ["choice-band", "150 Coins"], ["choice-specs", "150 Coins"], ["light-ball", "50 Coins"],
    ["exp-share", "65 Coins"], ["iv-randomizer", "25 Coins"], ["iv-potion", "20 Coins"],
    ["fire-stone", "15 Coins"], ["water-stone", "15 Coins"], ["thunder-stone", "15 Coins"], ["leaf-stone", "15 Coins"], ["shiny-stone", "15 Coins"],
    ["dusk-stone", "15 Coins"], ["dawn-stone", "15 Coins"], ["ice-stone", "15 Coins"], ["moon-stone", "15 Coins"], ["sun-stone", "15 Coins"],
  ]),
  ...g("shop", "Battle Tokens Shop", [
    ["gardevoirite", "2,000 Battle Tokens"], ["up-grade", "100 Battle Tokens"], ["dubious-disc", "100 Battle Tokens"],
    ["black-sludge", "250 Battle Tokens"], ["permanent-focus-sash", "250 Battle Tokens"], ["weakness-policy", "250 Battle Tokens"],
    ["white-herb", "250 Battle Tokens"], ["permanent-throat-spray", "150 Battle Tokens"], ["wide-lens", "150 Battle Tokens"],
    ["big-root", "150 Battle Tokens"], ["permanent-custap-berry", "200 Battle Tokens"],
  ]),
  ...g("shop", "Casino Token Trader", [
    ["fire-memory", "720 Tokens"], ["water-memory", "720 Tokens"], ["electric-memory", "720 Tokens"], ["grass-memory", "720 Tokens"],
    ["ice-memory", "720 Tokens"], ["fighting-memory", "720 Tokens"], ["poison-memory", "720 Tokens"], ["ground-memory", "720 Tokens"],
    ["flying-memory", "720 Tokens"], ["psychic-memory", "720 Tokens"], ["bug-memory", "720 Tokens"], ["rock-memory", "720 Tokens"],
    ["ghost-memory", "720 Tokens"], ["dragon-memory", "720 Tokens"], ["dark-memory", "720 Tokens"], ["steel-memory", "720 Tokens"],
    ["fairy-memory", "720 Tokens"], ["life-orb", "2,100 Tokens"], ["rare-candy", "140 Tokens"],
  ]),
  ...g("shop", "Ranked Battle Tokens Trader", [
    ["heavy-duty-boots", "350 Tokens"], ["expert-belt", "400 Tokens"], ["safety-goggles", "300 Tokens"], ["shed-shell", "300 Tokens"],
    ["eject-button", "300 Tokens"], ["lagging-tail", "300 Tokens"], ["binding-band", "120 Tokens"], ["blunder-policy", "120 Tokens"],
    ["cell-battery", "120 Tokens"], ["snowball", "120 Tokens"], ["grip-claw", "120 Tokens"],
  ]),
  ...g("shop", "Daycare Shop", [
    ["gold-amulet", "300 Coins"], ["power-weight", "200 Coins"], ["power-bracer", "200 Coins"], ["power-belt", "200 Coins"],
    ["power-lens", "200 Coins"], ["power-band", "200 Coins"], ["power-anklet", "200 Coins"], ["everstone", "75 Coins"], ["smoke-ball", "25 Coins"],
    ["broken-tm-disk", "100 Coins — crafting material"],
    ["scroll-of-darkness", "600 Coins — Urshifu (Single Strike)"], ["scroll-of-waters", "600 Coins — Urshifu (Rapid Strike)"],
    ["everstone-exp-share-blueprint", "500 Coins"], ["macho-brace-exp-share-blueprint", "500 Coins"],
    ["move-block-exp-share-blueprint", "500 Coins"], ["soothe-share-blueprint", "500 Coins"],
  ]),
  // (Type-boost held items are already sold via the remote's "Daycare Token Shop"
  // at 75 Daycare Token — sourced from data/item-finder.json — so no entry here.)
  ...g("shop", "Mining Shop", [["gold-pickaxe-blueprint"], ["diamond-pickaxe-blueprint"], ["platinum-pickaxe-blueprint"]]),
  // Mega stone token shops (#2163)
  { item: "absolite", method: "shop", source: "PvP Store", detail: "2,500 Ranked Tokens" },
  { item: "tyranitarite", method: "shop", source: "Casino Token Store", detail: "45,000 Casino Tokens" },
];
