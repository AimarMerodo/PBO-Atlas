import { ChangeDetectionStrategy, Component, inject, input, signal } from "@angular/core";
import { LucideCheck, LucideCopy } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";

/** Copies a value to the clipboard and shows a transient "Copied!" state. */
@Component({
  selector: "app-copy-button",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCheck, LucideCopy],
  template: `
    <button
      (click)="copy()"
      [class]="
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ' +
        (copied()
          ? 'border-green-500/50 bg-green-500/10 text-green-400'
          : 'border-line bg-surface-2 text-ink-dim hover:text-ink')
      "
    >
      @if (copied()) {
        <svg lucideCheck class="h-3.5 w-3.5" aria-hidden="true"></svg>
        {{ i18n.t("feedback.copied") }}
      } @else {
        <svg lucideCopy class="h-3.5 w-3.5" aria-hidden="true"></svg>
        {{ i18n.t("feedback.copy") }}
      }
    </button>
  `,
})
export class CopyButton {
  readonly value = input.required<string>();

  protected readonly i18n = inject(LanguageService);
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.value());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // clipboard unavailable (http, old browser) — nothing to do
    }
  }
}
