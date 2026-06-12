import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";

@Component({
  selector: "app-pokedex-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- STUB: replaced in Fase 3 (block B) with the pokedex explorer -->
    <h1 class="text-center text-3xl font-extrabold tracking-tight">{{ i18n.t("pokedex.title") }}</h1>
  `,
})
export class PokedexPageComponent {
  protected readonly i18n = inject(LanguageService);
}
