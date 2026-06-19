import { ChangeDetectionStrategy, Component, inject, input, signal } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { GameItem, PokemonForm } from "@core/models/types";
import { TypeBadge } from "@shared/components/type-badge/type-badge";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { ItemModal } from "@features/game/item-modal/item-modal";
import { StatBars } from "@features/pokedex/components/stat-bars/stat-bars";

const SHOWDOWN = "https://play.pokemonshowdown.com/sprites";
const KIND_STYLE: Record<PokemonForm["kind"], Record<string, string>> = {
  mega: { background: "rgba(167,139,250,0.16)", color: "#a78bfa" },
  primal: { background: "rgba(251,146,60,0.16)", color: "#fb923c" },
  gmax: { background: "rgba(244,114,182,0.16)", color: "#f472b6" },
};

/** Mega Evolution / Primal Reversion / Gigantamax cards for a pokemon, with the
 *  form's types, base stats and (for megas) the Mega Stone needed (opens in place). */
@Component({
  selector: "app-pokemon-forms",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeBadge, ItemIcon, ItemModal, StatBars],
  templateUrl: "./pokemon-forms.html",
})
export class PokemonForms {
  readonly forms = input.required<PokemonForm[]>();
  protected readonly i18n = inject(LanguageService);
  protected readonly selectedStone = signal<GameItem | null>(null);

  protected sprite(id: string): string {
    return `${SHOWDOWN}/ani/${id}.gif`;
  }

  /** Fall back to the static gen5 sprite if the animated one is missing. */
  protected onError(e: Event, id: string): void {
    const img = e.target as HTMLImageElement;
    const png = `${SHOWDOWN}/gen5/${id}.png`;
    if (!img.src.endsWith(png)) img.src = png;
  }

  protected kindStyle(kind: PokemonForm["kind"]): Record<string, string> {
    return KIND_STYLE[kind];
  }

  protected kindLabel(kind: PokemonForm["kind"]): string {
    return this.i18n.t(("form." + kind) as DictKey);
  }

  protected localItemName(d: GameItem): string {
    return this.i18n.pick({ en: d.name, es: d.es, zh: d.zh, pt: d.pt });
  }
}
