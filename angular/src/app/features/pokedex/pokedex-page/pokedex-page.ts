import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { LucideFilterX, LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { PokedexCard } from "@core/models/types";
import { TYPE_COLORS } from "@core/utils/colors";
import { Pager } from "@shared/components/pager/pager";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

const PAGE_SIZE = 30;
const REGION_ORDER = ["sinnoh", "jvaloh", "hoenn", "kanto"];
const RARITY_OPTIONS = ["common", "uncommon", "rare", "very-rare", "ultra-rare", "legendary"] as const;
const EV_STATS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"] as const;
type SortKey = "number" | "name" | "stats";

/** Pokedex grid with name/number search, type/region/rarity/gen/EV filters and sorting. */
@Component({
  selector: "app-pokedex-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideFilterX, LucideSearch, Pager, TypeBadge],
  templateUrl: "./pokedex-page.html",
})
export class PokedexPageComponent {
  private readonly data = inject(DataService);
  protected readonly i18n = inject(LanguageService);

  protected readonly list = resource({ loader: () => this.data.pokedexList() });

  protected readonly query = signal("");
  protected readonly type = signal<string | null>(null);
  protected readonly region = signal<string | null>(null);
  protected readonly rarity = signal<string | null>(null);
  protected readonly gen = signal<number | null>(null);
  protected readonly ev = signal<string | null>(null);
  protected readonly sort = signal<SortKey>("number");
  protected readonly page = signal(1);

  protected readonly typeOptions = Object.keys(TYPE_COLORS);
  protected readonly regionOptions = REGION_ORDER.map((r) => ({ value: r, label: r[0].toUpperCase() + r.slice(1) }));
  protected readonly rarityOptions = RARITY_OPTIONS;
  protected readonly evStats = EV_STATS;

  protected readonly selectClass =
    "rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm capitalize text-ink outline-none transition-colors hover:border-accent/40";

  protected readonly generations = computed(() => {
    const all = this.list.value() ?? [];
    return [...new Set(all.map((p) => p.generation).filter((g): g is number => g !== null))].sort((a, b) => a - b);
  });

  protected readonly hasActiveFilters = computed(() =>
    Boolean(
      this.query() || this.type() || this.region() || this.rarity() || this.gen() || this.ev() || this.sort() !== "number"
    )
  );

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const type = this.type();
    const region = this.region();
    const rarity = this.rarity();
    const gen = this.gen();
    const ev = this.ev();
    const out = (this.list.value() ?? []).filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && String(p.id) !== q) return false;
      if (type && !p.types.includes(type)) return false;
      if (region && !p.regions.includes(region)) return false;
      if (rarity && !p.rarities.includes(rarity)) return false;
      if (gen && p.generation !== gen) return false;
      if (ev && !p.evs.includes(ev)) return false;
      return true;
    });
    const sort = this.sort();
    if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "stats") out.sort((a, b) => b.bst - a.bst || a.id - b.id);
    // "number" keeps the incoming dex order
    return out;
  });

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  protected readonly current = computed(() => Math.min(this.page(), this.pageCount()));
  protected readonly visible = computed(() => {
    const start = (this.current() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    inject(Title).setTitle("Pokédex | PBO Atlas");
    inject(Meta).updateTag({
      name: "description",
      content: "Complete Pokemon Blaze Online pokedex with catch locations.",
    });
  }

  protected setQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }

  protected setType(value: string): void {
    this.type.set(value || null);
    this.page.set(1);
  }

  protected setRegion(value: string): void {
    this.region.set(value || null);
    this.page.set(1);
  }

  protected setRarity(value: string): void {
    this.rarity.set(value || null);
    this.page.set(1);
  }

  protected setGen(value: string): void {
    this.gen.set(value ? Number(value) : null);
    this.page.set(1);
  }

  protected setEv(value: string): void {
    this.ev.set(value || null);
    this.page.set(1);
  }

  protected setSort(value: string): void {
    this.sort.set(value as SortKey);
    this.page.set(1);
  }

  protected clearFilters(): void {
    this.query.set("");
    this.type.set(null);
    this.region.set(null);
    this.rarity.set(null);
    this.gen.set(null);
    this.ev.set(null);
    this.sort.set("number");
    this.page.set(1);
  }

  protected goTo(page: number): void {
    this.page.set(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  protected tint(p: PokedexCard): string {
    return TYPE_COLORS[p.types[0]] ?? "#9099a1";
  }

  protected dexNo(id: number): string {
    return String(id).padStart(3, "0");
  }

  protected tKey(key: string): string {
    return this.i18n.t(key as DictKey);
  }
}
