import type { DictKey } from "@core/i18n/dictionaries";

// Canonical categories emitted by scripts/build-game-extras.mjs.
const CATEGORY_KEYS: Record<string, DictKey> = {
  Medicine: "items.cat.medicine",
  "Battle items": "items.cat.battle-items",
  "Hold items": "items.cat.hold-items",
  "Selling items": "items.cat.selling-items",
  "General items": "items.cat.general-items",
  Berries: "items.cat.berries",
  Pokeballs: "items.cat.pokeballs",
  Machines: "items.cat.machines",
  "Spawn item": "items.cat.spawn-item",
  Customisation: "items.cat.customisation",
};

/** Dictionary key for an item category, or null for unknown ones (shown as-is). */
export function itemCategoryKey(category: string): DictKey | null {
  return CATEGORY_KEYS[category] ?? null;
}
