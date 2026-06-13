import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";
import { GAME_NAME, GAME_URL } from "@core/contact";

@Component({
  selector: "app-site-footer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-line py-6">
      <p class="mx-auto max-w-6xl px-4 text-xs text-ink-dim">
        {{ i18n.t("footer.pre") }}
        <a
          [href]="gameUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-accent-soft hover:underline"
          >{{ gameName }}</a
        >
        {{ i18n.t("footer.post") }}
      </p>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly i18n = inject(LanguageService);
  protected readonly gameName = GAME_NAME;
  protected readonly gameUrl = GAME_URL;
}
