import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from "@angular/core";
import { LucideSparkles } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import { ShinyPreference } from "./shiny-preference";

/**
 * Pokemon artwork with a normal/shiny toggle and the animated battle sprite
 * (same Showdown-style animation the game uses).
 */
@Component({
  selector: "app-pokemon-artwork",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSparkles],
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
  // Shiny is a shared preference so it persists as you browse pokemon (set once,
  // every pokemon stays shiny until toggled off).
  private readonly shinyPref = inject(ShinyPreference);
  protected readonly shiny = this.shinyPref.shiny;
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
    this.shinyPref.toggle();
    this.aniFailed.set(false);
  }
}
