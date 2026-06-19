import { ChangeDetectionStrategy, Component, effect, inject, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { LucideArrowRight, LucideCheck } from "@lucide/angular";
import { CONTACT, GAME_URL } from "@core/contact";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";

interface Channel {
  name: DictKey;
  desc: DictKey;
  handle: string;
}

/** Editorial contact page: big statement + my in-game avatar, and a numbered list of channels. */
@Component({
  selector: "app-feedback-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideArrowRight, LucideCheck],
  templateUrl: "./feedback-page.html",
  styleUrl: "./feedback-page.css",
})
export class FeedbackPage {
  protected readonly i18n = inject(LanguageService);
  protected readonly gameUrl = GAME_URL;
  protected readonly makerName = CONTACT.ingame;

  protected readonly channels: Channel[] = [
    { name: "feedback.discordTitle", desc: "feedback.discordHint", handle: CONTACT.discord },
    { name: "feedback.ingameTitle", desc: "feedback.ingameHint", handle: CONTACT.ingame },
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
