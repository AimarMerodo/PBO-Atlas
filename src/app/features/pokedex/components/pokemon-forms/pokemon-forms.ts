import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { PokemonForm } from "@core/models/types";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

const KIND_STYLE: Record<PokemonForm["kind"], Record<string, string>> = {
  mega: { background: "rgba(167,139,250,0.16)", color: "#a78bfa" },
  primal: { background: "rgba(251,146,60,0.16)", color: "#fb923c" },
  gmax: { background: "rgba(244,114,182,0.16)", color: "#f472b6" },
};

/** Mega / Primal / Gigantamax forms of a pokemon, shown as evolution-line-style
 *  cards that link to each form's own full ficha. */
@Component({
  selector: "app-pokemon-forms",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TypeBadge],
  templateUrl: "./pokemon-forms.html",
})
export class PokemonForms {
  readonly forms = input.required<PokemonForm[]>();
  private readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  /** Warm the cache on hover so clicking a form navigates instantly. */
  protected preload(slug: string): void {
    void this.data.pokemon(slug);
  }

  protected kindStyle(kind: PokemonForm["kind"]): Record<string, string> {
    return KIND_STYLE[kind];
  }

  protected kindLabel(kind: PokemonForm["kind"]): string {
    return this.i18n.t(("form." + kind) as DictKey);
  }
}
