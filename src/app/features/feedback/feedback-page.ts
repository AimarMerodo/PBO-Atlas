import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { LucideGamepad2, LucideInfo, LucideMessageCircle } from "@lucide/angular";
import { CONTACT, GAME_URL } from "@core/contact";
import { LanguageService } from "@core/i18n/language.service";
import { CopyButton } from "@features/feedback/copy-button/copy-button";

/** Contact cards (Discord + in-game) and what to include in a data report. */
@Component({
  selector: "app-feedback-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideGamepad2, LucideInfo, LucideMessageCircle, CopyButton],
  templateUrl: "./feedback-page.html",
})
export class FeedbackPage {
  protected readonly i18n = inject(LanguageService);
  protected readonly contact = CONTACT;
  protected readonly gameUrl = GAME_URL;

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "Report wrong data or send suggestions for PBO Atlas.",
    });
    effect(() => title.setTitle(`${this.i18n.t("feedback.title")} | PBO Atlas`));
  }
}
