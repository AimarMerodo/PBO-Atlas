import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { LucideMapPin } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import { DataService } from "@core/data/data.service";
import type { SearchIndex } from "@core/models/types";
import { DismissOutside } from "@shared/directives/dismiss-outside";

/**
 * Search dialog open/close state. The trigger button lives in the header,
 * but the overlay must render at the app root: the header's backdrop-filter
 * creates a containing block that would trap a position:fixed overlay.
 */
export const searchOpen = signal(false);

/** Global search overlay. Rendered at the app root (see searchOpen). */
@Component({
  selector: "app-search-dialog",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideMapPin, DismissOutside],
  templateUrl: "./search-dialog.html",
})
export class SearchDialog {
  protected readonly i18n = inject(LanguageService);
  protected readonly searchOpen = searchOpen;
  private readonly data = inject(DataService);
  private readonly router = inject(Router);

  protected readonly query = signal("");
  protected readonly index = signal<SearchIndex | null>(null);

  private readonly input = viewChild<ElementRef<HTMLInputElement>>("queryInput");

  constructor() {
    effect(() => {
      if (searchOpen()) {
        this.query.set("");
        if (!this.index()) void this.data.searchIndex().then((index) => this.index.set(index));
        this.input()?.nativeElement.focus();
      }
    });
  }

  protected readonly pokemonResults = computed(() => {
    const q = this.query().trim().toLowerCase();
    const index = this.index();
    if (!q || !index) return [];
    return index.pokemon.filter((p) => p.name.toLowerCase().includes(q) || String(p.id) === q).slice(0, 8);
  });

  protected readonly locationResults = computed(() => {
    const q = this.query().trim().toLowerCase();
    const index = this.index();
    if (!q || !index) return [];
    return index.locations.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 8);
  });

  @HostListener("window:keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchOpen.set(true);
    }
    if (event.key === "Escape") searchOpen.set(false);
  }

  protected go(href: string): void {
    searchOpen.set(false);
    void this.router.navigateByUrl(href);
  }
}
