import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { LucideFilterX, LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { PokedexCard } from "@core/models/types";
import { TYPE_COLORS } from "@core/utils/colors";
import { paginate } from "@core/utils/paginate";
import { pad } from "@core/utils/format";
import { Combobox } from "@shared/components/combobox/combobox";
import { Pager } from "@shared/components/pager/pager";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

const PAGE_SIZE = 30;
const REGION_ORDER = ["sinnoh", "jvaloh", "hoenn", "kanto"];
const RARITY_OPTIONS = ["common", "uncommon", "rare", "very-rare", "ultra-rare", "legendary"] as const;
const EV_STATS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"] as const;
type SortKey = "number" | "name" | "stats";
type FilterKey = "query" | "type" | "region" | "rarity" | "gen" | "ev" | "event" | "ability" | "move" | "sort";

/** Pokedex grid with name/number search, type/region/rarity/gen/EV filters and sorting. */
@Component({
  selector: "app-pokedex-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideFilterX, LucideSearch, Pager, TypeBadge, Combobox],
  templateUrl: "./pokedex-page.html",
})
export class PokedexPageComponent {
  private readonly data = inject(DataService);
  protected readonly i18n = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly list = resource({ loader: () => this.data.pokedexList() });
  // Ability/move picker options (small). The move->pokemon index is big, so it's only
  // fetched once the user actually picks a move (params() stays undefined until then).
  protected readonly filterOpts = resource({ loader: () => this.data.filters() });
  private readonly moveIndexRes = resource({
    params: () => (this.move() ? true : undefined),
    loader: () => this.data.moveIndex(),
  });

  /** Warm the cache on hover so clicking a card navigates instantly. */
  protected preload(slug: string): void {
    void this.data.pokemon(slug);
  }

  protected readonly query = signal("");
  protected readonly type = signal<string | null>(null);
  protected readonly region = signal<string | null>(null);
  protected readonly rarity = signal<string | null>(null);
  protected readonly gen = signal<number | null>(null);
  protected readonly ev = signal<string | null>(null);
  protected readonly event = signal<string | null>(null);
  protected readonly ability = signal<string | null>(null);
  protected readonly move = signal<string | null>(null);
  protected readonly sort = signal<SortKey>("number");
  // Page lives in the URL (?page=N) so returning to the list (e.g. browser back
  // after opening a pokemon) lands you on the same page instead of page 1.
  protected readonly page = signal(Math.max(1, Number(this.route.snapshot.queryParamMap.get("page")) || 1));
  /** On by default: hide pokemon confirmed absent from PBO (forms/variants). */
  protected readonly hideNotInPbo = signal(true);

  /** Single source of truth for the filter signals: maps a field to how to reset it
   *  and how to write a raw <input>/<select> string into its signal. */
  private readonly filters = {
    query: { reset: () => this.query.set(""), coerce: (v: string) => this.query.set(v) },
    type: { reset: () => this.type.set(null), coerce: (v: string) => this.type.set(v || null) },
    region: { reset: () => this.region.set(null), coerce: (v: string) => this.region.set(v || null) },
    rarity: { reset: () => this.rarity.set(null), coerce: (v: string) => this.rarity.set(v || null) },
    gen: { reset: () => this.gen.set(null), coerce: (v: string) => this.gen.set(v ? Number(v) : null) },
    ev: { reset: () => this.ev.set(null), coerce: (v: string) => this.ev.set(v || null) },
    event: { reset: () => this.event.set(null), coerce: (v: string) => this.event.set(v || null) },
    ability: { reset: () => this.ability.set(null), coerce: (v: string) => this.ability.set(v || null) },
    move: { reset: () => this.move.set(null), coerce: (v: string) => this.move.set(v || null) },
    sort: { reset: () => this.sort.set("number"), coerce: (v: string) => this.sort.set(v as SortKey) },
  } as const;

  protected readonly typeOptions = Object.keys(TYPE_COLORS);
  protected readonly regionOptions = REGION_ORDER.map((r) => ({ value: r, label: r[0].toUpperCase() + r.slice(1) }));
  protected readonly rarityOptions = RARITY_OPTIONS;
  protected readonly evStats = EV_STATS;

  protected readonly selectClass =
    "rounded-lg border border-line bg-surface pl-2.5 pr-8 py-1.5 text-sm capitalize text-ink outline-none transition-colors hover:border-accent/40";

  protected readonly generations = computed(() => {
    const all = this.list.value() ?? [];
    return [...new Set(all.map((p) => p.generation).filter((g): g is number => g !== null))].sort((a, b) => a - b);
  });

  protected readonly eventOptions = computed(() =>
    [...new Set((this.list.value() ?? []).map((p) => p.event).filter((e): e is string => !!e))].sort()
  );

  protected readonly hasActiveFilters = computed(() =>
    Boolean(
      this.query() ||
        this.type() ||
        this.region() ||
        this.rarity() ||
        this.gen() ||
        this.ev() ||
        this.event() ||
        this.ability() ||
        this.move() ||
        this.sort() !== "number"
    )
  );

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const type = this.type();
    const region = this.region();
    const rarity = this.rarity();
    const gen = this.gen();
    const ev = this.ev();
    const event = this.event();
    const ability = this.ability();
    const move = this.move();
    const moveIdx = this.moveIndexRes.value();
    const moveSet = move && moveIdx && moveIdx[move] ? new Set(moveIdx[move]) : null;
    const hideNip = this.hideNotInPbo();
    const out = (this.list.value() ?? []).filter((p) => {
      if (hideNip && p.notInPbo) return false;
      if (event && p.event !== event) return false;
      if (ability && !(p.abilities ?? []).includes(ability)) return false;
      if (moveSet && !moveSet.has(p.slug)) return false;
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

  private readonly paged = computed(() => paginate(this.filtered(), this.page(), PAGE_SIZE));
  protected readonly pageCount = computed(() => this.paged().pageCount);
  protected readonly current = computed(() => this.paged().current);
  protected readonly visible = computed(() => this.paged().visible);

  constructor() {
    inject(Title).setTitle("Pokédex | PBO Atlas");
    inject(Meta).updateTag({
      name: "description",
      content: "Complete Pokemon Blaze Online pokedex with catch locations.",
    });
  }

  /** Write any filter field from its raw control value; always resets to page 1. */
  protected set(key: FilterKey, value: string): void {
    this.filters[key].coerce(value);
    this.page.set(1);
    this.syncPageUrl();
  }

  protected clearFilters(): void {
    for (const f of Object.values(this.filters)) f.reset();
    this.page.set(1);
    this.syncPageUrl();
  }

  protected goTo(page: number): void {
    this.page.set(page);
    this.syncPageUrl();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Reflect the current page in the URL (?page=N, dropped on page 1). */
  private syncPageUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.page() > 1 ? this.page() : null },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }

  protected tint(p: PokedexCard): string {
    return TYPE_COLORS[p.types[0]] ?? "#9099a1";
  }

  protected readonly pad = pad;
}
