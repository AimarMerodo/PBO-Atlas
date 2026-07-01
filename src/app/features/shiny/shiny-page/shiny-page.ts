import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { LucideHeart, LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import { paginate } from "@core/utils/paginate";
import { Pager } from "@shared/components/pager/pager";
import { ShinyCard } from "../shiny-card/shiny-card";

const KEY = "pbo-shiny-favs";
const PAGE_SIZE = 48;

/** Shiny gallery: browse/search every in-game shiny sprite and favourite them
 *  (saved in localStorage), with a "favourites only" view. */
@Component({
  selector: "app-shiny-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Pager, ShinyCard, LucideHeart, LucideSearch],
  templateUrl: "./shiny-page.html",
})
export class ShinyPageComponent {
  private readonly data = inject(DataService);
  protected readonly i18n = inject(LanguageService);

  protected readonly list = resource({ loader: () => this.data.pokedexList() });

  protected readonly query = signal("");
  protected readonly favsOnly = signal(false);
  protected readonly favs = signal<Set<string>>(new Set(this.load()));
  protected readonly page = signal(1);

  /** Every real mon with a shiny sprite. Event forms are excluded outright (none
   *  have a shiny; the guard also future-proofs against data changes). */
  private readonly shinies = computed(() => (this.list.value() ?? []).filter((p) => p.spriteShiny && !p.event));

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const favsOnly = this.favsOnly();
    const favs = this.favs();
    return this.shinies().filter((p) => {
      if (favsOnly && !favs.has(p.slug)) return false;
      if (q && !p.name.toLowerCase().includes(q) && String(p.id) !== q) return false;
      return true;
    });
  });

  private readonly paged = computed(() => paginate(this.filtered(), this.page(), PAGE_SIZE));
  protected readonly pageCount = computed(() => this.paged().pageCount);
  protected readonly current = computed(() => this.paged().current);
  protected readonly visible = computed(() => this.paged().visible);
  protected readonly favCount = computed(() => this.favs().size);

  constructor() {
    inject(Title).setTitle("Shiny gallery | PBO Atlas");
    inject(Meta).updateTag({ name: "description", content: "Browse every shiny sprite in Pokemon Blaze Online and save your favourites." });
  }

  protected isFav(slug: string): boolean {
    return this.favs().has(slug);
  }
  protected toggleFav(slug: string): void {
    const next = new Set(this.favs());
    next.has(slug) ? next.delete(slug) : next.add(slug);
    this.favs.set(next);
    try {
      localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* SSR / no storage */
    }
  }
  protected setQuery(v: string): void {
    this.query.set(v);
    this.page.set(1);
  }
  protected toggleFavsOnly(): void {
    this.favsOnly.update((v) => !v);
    this.page.set(1);
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
}
