import { ChangeDetectionStrategy, Component, effect, inject, signal } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { Meta, Title } from "@angular/platform-browser";
import { LucideArrowRight, LucideArrowUpRight, LucideCheck } from "@lucide/angular";
import { CONTACT, GAME_URL, REPO_URL } from "@core/contact";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";

interface Channel {
  name: DictKey;
  desc: DictKey;
  /** Shown to the right of the name (handle or repo path). */
  handle: string;
  /** When set the row links out; otherwise clicking copies the handle. */
  href?: string;
}

/** Editorial contact page: big statement + my in-game avatar, and a numbered list of channels. */
@Component({
  selector: "app-feedback-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, LucideArrowRight, LucideArrowUpRight, LucideCheck],
  templateUrl: "./feedback-page.html",
  styleUrl: "./feedback-page.css",
})
export class FeedbackPage {
  protected readonly i18n = inject(LanguageService);
  protected readonly gameUrl = GAME_URL;
  protected readonly makerName = CONTACT.ingame;

  protected readonly channels: Channel[] = [
    { name: "feedback.discordTitle", desc: "feedback.discordHint", handle: CONTACT.discord },
    { name: "feedback.ingameShort", desc: "feedback.ingameHint", handle: CONTACT.ingame },
    { name: "feedback.githubTitle", desc: "feedback.githubHint", handle: CONTACT.repo, href: REPO_URL },
  ];

  /** Index of the channel whose handle was just copied (for the ✓ feedback). */
  protected readonly copiedIdx = signal<number | null>(null);

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "Report wrong data or send suggestions for PBO Atlas.",
    });
    effect(() => title.setTitle(`${this.i18n.t("feedback.title")} | PBO Atlas`));
  }

  protected pad(n: number): string {
    return String(n).padStart(2, "0");
  }

  protected async copy(index: number, value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copiedIdx.set(index);
      setTimeout(() => this.copiedIdx.set(null), 1500);
    } catch {
      // clipboard unavailable (http / old browser) — nothing to do
    }
  }
}
