import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LucideHeart } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import { GAME_NAME, GAME_URL } from "@core/contact";

@Component({
  selector: "app-site-footer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideHeart],
  template: `
    <footer class="border-t border-line py-6">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-xs text-ink-dim sm:flex-row sm:justify-between sm:gap-4"
      >
        <p class="inline-flex items-center gap-1 whitespace-nowrap">
          {{ i18n.t("footer.madeWithPre") }}
          <svg lucideHeart class="h-3.5 w-3.5 fill-current text-accent" aria-hidden="true"></svg>
          {{ i18n.t("footer.madeWithPost") }}
        </p>
        <p class="text-center sm:text-right">
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
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly i18n = inject(LanguageService);
  protected readonly gameName = GAME_NAME;
  protected readonly gameUrl = GAME_URL;
}
