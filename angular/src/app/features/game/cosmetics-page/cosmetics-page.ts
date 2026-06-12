import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";

@Component({
  selector: "app-cosmetics-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- STUB: replaced in Fase 3 (block C) with the cosmetics explorer -->
    <h1 class="text-center text-3xl font-extrabold tracking-tight">{{ i18n.t("cosmetics.title") }}</h1>
  `,
})
export class CosmeticsPageComponent {
  protected readonly i18n = inject(LanguageService);
}
