import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideGripVertical, LucideHeart } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { PokedexCard } from "@core/models/types";
import { pad } from "@core/utils/format";

/** One shiny in the gallery: the animated Showdown shiny render (falls back to the
 *  static shiny sprite if that GIF is missing) plus a wide, labelled favourite toggle. */
@Component({
  selector: "app-shiny-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideGripVertical, LucideHeart],
  template: `
    <div
      class="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:-translate-y-0.5"
      [style.border-color]="fav() ? 'rgb(248 113 113 / 0.55)' : null"
    >
      @if (reorderable()) {
        <!-- Drag affordance: the whole card drags; this just signals it -->
        <span
          class="pointer-events-none absolute left-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-md border border-line bg-bg/70 text-ink-dim opacity-80 shadow-sm group-hover:opacity-100"
        >
          <svg lucideGripVertical class="h-3.5 w-3.5" aria-hidden="true"></svg>
        </span>
      }
      <a [routerLink]="['/pokedex', card().slug]" class="flex flex-col items-center px-3 pt-3 transition-colors group-hover:bg-surface-2/40">
        <div class="grid h-24 w-full place-items-center">
          @if (aniUrl() && !failed()) {
            <img
              [src]="aniUrl()"
              [alt]="card().name + ' shiny'"
              (error)="failed.set(true)"
              loading="lazy"
              class="max-h-24 w-auto scale-125 [image-rendering:pixelated]"
            />
          } @else {
            <img [src]="card().spriteShiny" [alt]="card().name + ' shiny'" width="80" height="80" loading="lazy" class="[image-rendering:pixelated]" />
          }
        </div>
        <span class="mt-1 text-center text-xs font-semibold leading-tight">{{ card().name }}</span>
        <span class="mb-2 font-mono text-[10px] text-ink-dim">#{{ pad(card().id, 3) }}</span>
      </a>

      <button
        type="button"
        (click)="toggle.emit()"
        [attr.aria-pressed]="fav()"
        [attr.aria-label]="(fav() ? i18n.t('shiny.saved') : i18n.t('shiny.favourite')) + ': ' + card().name"
        class="flex items-center justify-center gap-1.5 border-t px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        [class]="
          fav()
            ? 'border-red-400/40 bg-red-500/15 text-red-300 hover:bg-red-500/25'
            : 'border-line text-ink-dim hover:bg-surface-2 hover:text-red-300'
        "
      >
        <svg lucideHeart class="h-4 w-4" [attr.fill]="fav() ? 'currentColor' : 'none'" aria-hidden="true"></svg>
        {{ fav() ? i18n.t("shiny.saved") : i18n.t("shiny.favourite") }}
      </button>
    </div>
  `,
})
export class ShinyCard {
  readonly card = input.required<PokedexCard>();
  readonly fav = input(false);
  /** Shows a drag-affordance grip (used in the reorderable favourites view). */
  readonly reorderable = input(false);
  readonly toggle = output<void>();

  protected readonly i18n = inject(LanguageService);
  protected readonly pad = pad;
  protected readonly failed = signal(false);

  /** Showdown animated-shiny GIF derived from the dashless in-game sprite filename. */
  private readonly stem = computed(() => this.card().sprite?.match(/\/([a-z0-9]+)\.png$/)?.[1] ?? null);
  protected readonly aniUrl = computed(() =>
    this.stem() ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${this.stem()}.gif` : null,
  );
}
