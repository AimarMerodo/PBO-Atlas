import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { LucideMapPin, LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { SearchIndex } from "@core/models/types";

/**
 * Inline hero search: a real input with its own results dropdown (pokemon +
 * locations). Independent of the global Ctrl+K dialog.
 */
@Component({
  selector: "app-hero-search",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSearch, LucideMapPin],
  templateUrl: "./hero-search.html",
})
export class HeroSearch {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly query = signal("");
  protected readonly open = signal(false);
  protected readonly index = signal<SearchIndex | null>(null);

  protected readonly pokemonResults = computed(() => {
    const q = this.query().trim().toLowerCase();
    const index = this.index();
    if (!q || !index) return [];
    return index.pokemon.filter((p) => p.name.toLowerCase().includes(q) || String(p.id) === q).slice(0, 6);
  });

  protected readonly locationResults = computed(() => {
    const q = this.query().trim().toLowerCase();
    const index = this.index();
    if (!q || !index) return [];
    return index.locations.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 6);
  });

  protected readonly hasResults = computed(() => this.pokemonResults().length > 0 || this.locationResults().length > 0);

  private load(): void {
    if (!this.index()) void this.data.searchIndex().then((index) => this.index.set(index));
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.open.set(true);
    this.load();
  }

  protected onFocus(): void {
    this.load();
    if (this.query().trim()) this.open.set(true);
  }

  protected onEnter(): void {
    const first = this.pokemonResults()[0] ?? null;
    if (first) {
      this.go("/pokedex/" + first.slug);
      return;
    }
    const loc = this.locationResults()[0] ?? null;
    if (loc) this.go("/region/" + loc.region + "/" + loc.id);
  }

  protected go(href: string): void {
    this.open.set(false);
    this.query.set("");
    void this.router.navigateByUrl(href);
  }

  @HostListener("document:click", ["$event"])
  onDocClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    this.open.set(false);
  }
}
