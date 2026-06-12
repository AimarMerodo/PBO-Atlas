import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideGamepad2, LucideMessageCircle } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import { CONTACT } from "@core/contact";

@Component({
  selector: "app-feedback-banner",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideGamepad2, LucideMessageCircle],
  template: `
    <div class="border-t border-line bg-surface/60">
      <div
        class="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 py-2.5 text-xs text-ink-dim"
      >
        <span>{{ i18n.t("banner.text") }}</span>
        <span class="inline-flex items-center gap-1.5">
          <svg lucideMessageCircle class="h-3.5 w-3.5 text-accent-soft" aria-hidden="true"></svg>
          Discord <code class="rounded bg-surface-2 px-1.5 py-0.5 text-ink">{{ contact.discord }}</code>
        </span>
        <span class="inline-flex items-center gap-1.5">
          <svg lucideGamepad2 class="h-3.5 w-3.5 text-accent-soft" aria-hidden="true"></svg>
          {{ i18n.t("banner.ingame") }}
          <code class="rounded bg-surface-2 px-1.5 py-0.5 text-ink">{{ contact.ingame }}</code>
        </span>
        <a routerLink="/feedback" class="font-medium text-accent-soft hover:underline">{{ i18n.t("banner.link") }}</a>
      </div>
    </div>
  `,
})
export class FeedbackBanner {
  protected readonly i18n = inject(LanguageService);
  protected readonly contact = CONTACT;
}
