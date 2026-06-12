import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";

@Component({
  selector: "app-feedback-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- STUB: replaced in Fase 3 (block C) with the contact cards -->
    <h1 class="text-center text-3xl font-extrabold tracking-tight">{{ i18n.t("feedback.title") }}</h1>
  `,
})
export class FeedbackPage {
  protected readonly i18n = inject(LanguageService);
}
