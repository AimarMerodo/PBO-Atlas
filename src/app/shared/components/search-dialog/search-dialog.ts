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
import { SearchDialogService } from "./search-dialog.service";

/** Global search overlay. Rendered at the app root (see SearchDialogService). */
@Component({
  selector: "app-search-dialog",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideMapPin, DismissOutside],
  templateUrl: "./search-dialog.html",
})
export class SearchDialog {
  protected readonly i18n = inject(LanguageService);
  protected readonly dialog = inject(SearchDialogService);
  private readonly data = inject(DataService);
  private readonly router = inject(Router);

  protected readonly query = signal("");
  protected readonly index = signal<SearchIndex | null>(null);

  private readonly input = viewChild<ElementRef<HTMLInputElement>>("queryInput");

  constructor() {
    effect(() => {
      if (this.dialog.isOpen()) {
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
      this.dialog.open();
    }
    if (event.key === "Escape") this.dialog.close();
  }

  protected go(href: string): void {
    this.dialog.close();
    void this.router.navigateByUrl(href);
  }
}
