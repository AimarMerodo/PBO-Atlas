import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, output } from "@angular/core";
import { LucideMapPin, LucideSparkles } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { TypeBadge } from "@shared/components/type-badge/type-badge";
import { hrefFor, type SearchGroups } from "./search";

const ACTIVE = "bg-surface-2 ring-1 ring-inset ring-accent";

/**
 * Shared result list for the global search — rendered by both the hero search
 * dropdown and the Ctrl+K dialog. Emits the chosen href via (go); the parent
 * handles closing + navigation. `activeHref` highlights the keyboard-selected row.
 */
@Component({
  selector: "app-search-results",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideMapPin, LucideSparkles, ItemIcon, TypeBadge],
  template: `
    @if (results().pokemon.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.pokemon") }}</p>
      @for (p of results().pokemon; track p.slug) {
        <button
          (click)="go.emit(href.pokemon(p.slug))"
          [attr.data-active]="isActive(href.pokemon(p.slug)) || null"
          [class]="rowClass + (isActive(href.pokemon(p.slug)) ? ' ' + ACTIVE : '')"
        >
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
    @if (results().moves.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.moves") }}</p>
      @for (m of results().moves; track m.slug) {
        <button
          (click)="go.emit(href.move(m.slug))"
          [attr.data-active]="isActive(href.move(m.slug)) || null"
          [class]="rowClass + (isActive(href.move(m.slug)) ? ' ' + ACTIVE : '')"
        >
          <app-type-badge [type]="m.type" />
          <span class="text-sm">{{ i18n.localName(m) }}</span>
        </button>
      }
    }
    @if (results().abilities.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.abilities") }}</p>
      @for (a of results().abilities; track a.slug) {
        <button
          (click)="go.emit(href.ability(a.slug))"
          [attr.data-active]="isActive(href.ability(a.slug)) || null"
          [class]="rowClass + (isActive(href.ability(a.slug)) ? ' ' + ACTIVE : '')"
        >
          <svg lucideSparkles class="h-4 w-4 shrink-0 text-ink-dim" aria-hidden="true"></svg>
          <span class="text-sm">{{ i18n.localName(a) }}</span>
        </button>
      }
    }
    @if (results().items.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.items") }}</p>
      @for (i of results().items; track i.slug) {
        <button
          (click)="go.emit(href.item(i.slug))"
          [attr.data-active]="isActive(href.item(i.slug)) || null"
          [class]="rowClass + (isActive(href.item(i.slug)) ? ' ' + ACTIVE : '')"
        >
          <app-item-icon [icon]="i.icon" [size]="28" />
          <span class="text-sm">{{ i18n.localName(i) }}</span>
        </button>
      }
    }
    @if (results().mounts.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.mounts") }}</p>
      @for (m of results().mounts; track m.name) {
        <button
          (click)="go.emit(href.mount(m.name))"
          [attr.data-active]="isActive(href.mount(m.name)) || null"
          [class]="rowClass + (isActive(href.mount(m.name)) ? ' ' + ACTIVE : '')"
        >
          <app-item-icon [icon]="m.icon" [size]="28" />
          <span class="text-sm">{{ i18n.localName(m) }}</span>
        </button>
      }
    }
    @if (results().cosmetics.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.cosmetics") }}</p>
      @for (c of results().cosmetics; track c.slug) {
        <button
          (click)="go.emit(href.cosmetic(c.slug))"
          [attr.data-active]="isActive(href.cosmetic(c.slug)) || null"
          [class]="rowClass + (isActive(href.cosmetic(c.slug)) ? ' ' + ACTIVE : '')"
        >
          <app-item-icon [icon]="c.icon" [size]="28" />
          <span class="text-sm">{{ c.name }}</span>
        </button>
      }
    }
    @if (results().locations.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.locations") }}</p>
      @for (l of results().locations; track l.region + l.id) {
        <button
          (click)="go.emit(href.location(l.region, l.id))"
          [attr.data-active]="isActive(href.location(l.region, l.id)) || null"
          [class]="rowClass + (isActive(href.location(l.region, l.id)) ? ' ' + ACTIVE : '')"
        >
          <svg lucideMapPin class="h-4 w-4 shrink-0 text-ink-dim" aria-hidden="true"></svg>
          <span class="text-sm">{{ l.name }}</span>
          <span class="ml-auto text-xs capitalize text-ink-dim">{{ l.region }}</span>
        </button>
      }
    }
    @if (results().regions.length) {
      <p class="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-ink-dim">{{ i18n.t("search.regions") }}</p>
      @for (r of results().regions; track r.id) {
        <button
          (click)="go.emit(href.region(r.id))"
          [attr.data-active]="isActive(href.region(r.id)) || null"
          [class]="rowClass + (isActive(href.region(r.id)) ? ' ' + ACTIVE : '')"
        >
          <img [src]="'/maps/' + r.id + '.png'" alt="" width="48" height="32" class="h-8 w-12 shrink-0 rounded object-cover ring-1 ring-line" />
          <span class="text-sm">{{ r.name }}</span>
        </button>
      }
    }
  `,
})
export class SearchResults {
  readonly results = input.required<SearchGroups>();
  /** href of the keyboard-highlighted row (null = no selection, e.g. hero search). */
  readonly activeHref = input<string | null>(null);
  readonly go = output<string>();
  protected readonly i18n = inject(LanguageService);
  protected readonly href = hrefFor;
  protected readonly ACTIVE = ACTIVE;
  protected readonly rowClass = "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2";

  protected isActive(href: string): boolean {
    return href === this.activeHref();
  }

  constructor() {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    // Keep the highlighted row visible as you arrow through a long list.
    effect(() => {
      this.activeHref();
      queueMicrotask(() => host.querySelector("[data-active]")?.scrollIntoView({ block: "nearest" }));
    });
  }
}
