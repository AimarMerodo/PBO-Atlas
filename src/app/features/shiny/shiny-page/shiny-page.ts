import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";
import { LucideGripVertical, LucideHeart, LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { PokedexCard } from "@core/models/types";
import { paginate } from "@core/utils/paginate";
import { Pager } from "@shared/components/pager/pager";
import { ShinyCard } from "../shiny-card/shiny-card";

const KEY = "pbo-shiny-favs";
const PAGE_SIZE = 48;

/** Shiny gallery: browse/search every in-game shiny sprite and favourite them
 *  (saved in localStorage). The favourites view is a custom, drag-to-reorder list. */
@Component({
  selector: "app-shiny-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pager, ShinyCard, CdkDropList, CdkDrag, LucideGripVertical, LucideHeart, LucideSearch],
  templateUrl: "./shiny-page.html",
})
export class ShinyPageComponent {
  private readonly data = inject(DataService);
  protected readonly i18n = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly list = resource({ loader: () => this.data.pokedexList() });
  private readonly bySlug = computed(() => new Map((this.list.value() ?? []).map((c) => [c.slug, c])));

  protected readonly query = signal("");
  // Driven by the route (/shiny vs /shiny/favorites) so a refresh keeps the view.
  protected readonly favsOnly = signal(this.route.snapshot.data["favs"] === true);
  /** Favourites as an ordered list (the user's custom order); Set derived for lookups. */
  protected readonly favSlugs = signal<string[]>(this.load());
  protected readonly favSet = computed(() => new Set(this.favSlugs()));
  protected readonly page = signal(1);

  /** Every real mon with a shiny sprite. Event forms are excluded outright (none
   *  have a shiny; the guard also future-proofs against data changes). */
  private readonly shinies = computed(() => (this.list.value() ?? []).filter((p) => p.spriteShiny && !p.event));

  // --- Browse view (all shinies, dex order, paginated) ---
  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.shinies().filter((p) => !q || p.name.toLowerCase().includes(q) || String(p.id) === q);
  });
  private readonly paged = computed(() => paginate(this.filtered(), this.page(), PAGE_SIZE));
  protected readonly pageCount = computed(() => this.paged().pageCount);
  protected readonly current = computed(() => this.paged().current);
  protected readonly visible = computed(() => this.paged().visible);

  // --- Favourites view (custom order, drag-to-reorder) ---
  protected readonly favCards = computed(() =>
    this.favSlugs()
      .map((s) => this.bySlug().get(s))
      .filter((c): c is PokedexCard => !!c && !!c.spriteShiny),
  );
  /** Favourites filtered by the search box; drag is disabled while a query is active. */
  protected readonly favVisible = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.favCards().filter((p) => p.name.toLowerCase().includes(q) || String(p.id) === q) : this.favCards();
  });
  protected readonly dragDisabled = computed(() => this.query().trim() !== "");
  protected readonly favCount = computed(() => this.favSlugs().length);

  constructor() {
    inject(Title).setTitle("Shiny gallery | PBO Atlas");
    inject(Meta).updateTag({ name: "description", content: "Browse every shiny sprite in Pokemon Blaze Online and save your favourites." });
  }

  protected isFav(slug: string): boolean {
    return this.favSet().has(slug);
  }
  protected toggleFav(slug: string): void {
    const cur = this.favSlugs();
    this.save(cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);
  }
  /** Persist the new order after a drag (only fires while unfiltered, so indices align). */
  protected drop(ev: CdkDragDrop<PokedexCard[]>): void {
    const next = [...this.favSlugs()];
    moveItemInArray(next, ev.previousIndex, ev.currentIndex);
    this.save(next);
  }
  protected setQuery(v: string): void {
    this.query.set(v);
    this.page.set(1);
  }
  protected toggleFavsOnly(): void {
    void this.router.navigate([this.favsOnly() ? "/shiny" : "/shiny/favorites"]);
  }
  protected goTo(p: number): void {
    this.page.set(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private load(): string[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return []; // SSR / no storage
    }
  }
  private save(arr: string[]): void {
    this.favSlugs.set(arr);
    try {
      localStorage.setItem(KEY, JSON.stringify(arr));
    } catch {
      /* SSR / no storage */
    }
  }
}
