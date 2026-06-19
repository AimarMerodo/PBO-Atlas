import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from "@angular/core";
import { LucideSparkles } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";

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
  // Reset to normal/non-failed whenever the pokemon changes — otherwise the
  // component is reused across pokedex/:slug navigations and shiny stays stuck
  // on (worse: a form without shiny art hides the toggle, so it can't be undone).
  protected readonly shiny = linkedSignal({ source: this.name, computation: () => false });
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
}
