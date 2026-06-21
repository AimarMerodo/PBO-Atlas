import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { SearchIndex } from "@core/models/types";
import { firstHref, searchAll } from "@shared/components/search-dialog/search";
import { SearchResults } from "@shared/components/search-dialog/search-results";

/**
 * Inline hero search: a real input with its own results dropdown (pokemon +
 * locations). Independent of the global Ctrl+K dialog.
 */
@Component({
  selector: "app-hero-search",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSearch, SearchResults],
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

  protected readonly results = computed(() => searchAll(this.index(), this.query(), 6));

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
    const href = firstHref(this.results());
    if (href) this.go(href);
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
