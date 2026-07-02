import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { LanguageService } from "@core/i18n/language.service";
import { DataService } from "@core/data/data.service";
import type { SearchIndex } from "@core/models/types";
import { DismissOutside } from "@shared/directives/dismiss-outside";
import { flatHrefs, searchAll } from "./search";
import { SearchResults } from "./search-results";

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
  imports: [DismissOutside, SearchResults],
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

  protected readonly results = computed(() => searchAll(this.index(), this.query(), 8));
  /** Flat list of result hrefs (render order) for arrow-key navigation. */
  private readonly flat = computed(() => flatHrefs(this.results()));
  /** Highlighted result; resets to the top whenever the query (→ result list) changes. */
  protected readonly selected = linkedSignal({ source: this.flat, computation: () => 0 });
  protected readonly activeHref = computed(() => this.flat()[this.selected()] ?? null);

  @HostListener("window:keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchOpen.set(true);
    }
    if (!searchOpen()) return;
    if (event.key === "Escape") searchOpen.set(false);
    const last = this.flat().length - 1;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.selected.update((i) => Math.min(last, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      this.selected.update((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      const href = this.activeHref();
      if (href) {
        event.preventDefault();
        this.go(href);
      }
    }
  }

  protected go(href: string): void {
    searchOpen.set(false);
    void this.router.navigateByUrl(href);
  }
}
