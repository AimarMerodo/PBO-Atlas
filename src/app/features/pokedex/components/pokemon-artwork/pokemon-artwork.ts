import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from "@angular/core";
import { LucideFlame, LucideSparkles } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import { alphaEnabled, shinyEnabled } from "./shiny-preference";

/**
 * Pokemon artwork with a normal/shiny toggle and the animated battle sprite
 * (same Showdown-style animation the game uses).
 */
@Component({
  selector: "app-pokemon-artwork",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSparkles, LucideFlame],
  templateUrl: "./pokemon-artwork.html",
})
export class PokemonArtwork {
  readonly name = input.required<string>();
  readonly artwork = input.required<string | null>();
  readonly artworkShiny = input.required<string | null>();
  readonly spritePbo = input<string | null>(null);
  readonly spritePboShiny = input<string | null>(null);
  /** Explicit Showdown animated id (needed for forms whose dashless sprite
   *  filename can't be turned back into the dashed Showdown id). */
  readonly aniId = input<string | null>(null);

  protected readonly i18n = inject(LanguageService);
  // Shiny is a shared module-level preference so it persists as you browse pokemon
  // (set once, every pokemon stays shiny until toggled off).
  protected readonly shiny = shinyEnabled;
  protected readonly alpha = alphaEnabled;

  protected readonly altText = computed(
    () => this.name() + (this.shiny() ? " shiny" : "") + (this.alpha() ? " alpha" : ""),
  );
  /** Red Alpha aura — tight drop-shadows that hug the silhouette. Kept small so the
   *  blur doesn't merge across a wide sprite into a rectangular haze. */
  protected readonly auraFilter = computed(() =>
    this.alpha()
      ? "drop-shadow(0 0 2px rgba(239,68,68,1)) drop-shadow(0 0 4px rgba(239,68,68,0.9)) drop-shadow(0 0 6px rgba(239,68,68,0.6))"
      : null,
  );
  // Ani-failure is per-pokemon: reset when the pokemon changes so a missing
  // sprite on one doesn't force the static fallback on the next.
  protected readonly aniFailed = linkedSignal({ source: this.name, computation: () => false });

  protected readonly src = computed(() =>
    this.shiny() && this.artworkShiny() ? this.artworkShiny() : this.artwork()
  );
  protected readonly gameSprite = computed(() =>
    this.shiny() && this.spritePboShiny() ? this.spritePboShiny() : this.spritePbo()
  );

  /** Showdown id: explicit (forms) or derived from the in-game sprite filename. */
  private readonly showdownId = computed(
    () => this.aniId() ?? this.spritePbo()?.match(/\/([a-z0-9]+)\.png$/)?.[1] ?? null,
  );
  protected readonly aniUrl = computed(() => {
    const id = this.showdownId();
    return id ? `https://play.pokemonshowdown.com/sprites/ani${this.shiny() ? "-shiny" : ""}/${id}.gif` : null;
  });

  protected toggleShiny(): void {
    this.shiny.update((s) => !s);
    this.aniFailed.set(false);
  }

  protected toggleAlpha(): void {
    this.alpha.update((a) => !a);
  }
}
