import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";

@Component({
  selector: "app-items-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- STUB: replaced in Fase 3 (block C) with the items explorer -->
    <h1 class="text-center text-3xl font-extrabold tracking-tight">{{ i18n.t("items.title") }}</h1>
  `,
})
export class ItemsPageComponent {
  protected readonly i18n = inject(LanguageService);
}
