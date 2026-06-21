import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { LucideMapPin } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { hrefFor, type SearchGroups } from "./search";

/**
 * Shared result list for the global search — rendered by both the hero search
 * dropdown and the Ctrl+K dialog. Emits the chosen href via (go); the parent
 * handles closing + navigation.
 */
@Component({
  selector: "app-search-results",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideMapPin, ItemIcon],
  template: `
    @if (results().pokemon.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.pokemon") }}</p>
      @for (p of results().pokemon; track p.slug) {
        <button (click)="go.emit(href.pokemon(p.slug))" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
          @if (p.sprite) {
            <img [src]="p.sprite" alt="" width="32" height="32" class="h-8 w-8 object-contain" />
          } @else {
            <span class="w-8"></span>
          }
          <span class="text-sm">{{ p.name }}</span>
          <span class="ml-auto text-xs text-ink-dim">#{{ p.id }}</span>
        </button>
      }
    }
    @if (results().items.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.items") }}</p>
      @for (i of results().items; track i.slug) {
        <button (click)="go.emit(href.item(i.slug))" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
          <app-item-icon [icon]="i.icon" [size]="28" />
          <span class="text-sm">{{ i.name }}</span>
        </button>
      }
    }
    @if (results().mounts.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.mounts") }}</p>
      @for (m of results().mounts; track m.name) {
        <button (click)="go.emit(href.mount(m.name))" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
          <app-item-icon [icon]="m.icon" [size]="28" />
          <span class="text-sm">{{ m.name }}</span>
        </button>
      }
    }
    @if (results().cosmetics.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.cosmetics") }}</p>
      @for (c of results().cosmetics; track c.slug) {
        <button (click)="go.emit(href.cosmetic(c.slug))" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
          <app-item-icon [icon]="c.icon" [size]="28" />
          <span class="text-sm">{{ c.name }}</span>
        </button>
      }
    }
    @if (results().locations.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.locations") }}</p>
      @for (l of results().locations; track l.region + l.id) {
        <button (click)="go.emit(href.location(l.region, l.id))" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
          <svg lucideMapPin class="h-4 w-4 shrink-0 text-ink-dim" aria-hidden="true"></svg>
          <span class="text-sm">{{ l.name }}</span>
          <span class="ml-auto text-xs capitalize text-ink-dim">{{ l.region }}</span>
        </button>
      }
    }
    @if (results().regions.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.regions") }}</p>
      @for (r of results().regions; track r.id) {
        <button (click)="go.emit(href.region(r.id))" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2">
          <img [src]="'/maps/' + r.id + '.png'" alt="" width="48" height="32" class="h-8 w-12 shrink-0 rounded object-cover ring-1 ring-line" />
          <span class="text-sm">{{ r.name }}</span>
        </button>
      }
    }
  `,
})
export class SearchResults {
  readonly results = input.required<SearchGroups>();
  readonly go = output<string>();
  protected readonly i18n = inject(LanguageService);
  protected readonly href = hrefFor;
}
