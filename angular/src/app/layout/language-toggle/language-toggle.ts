import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";
import { LANGS } from "@core/i18n/dictionaries";

@Component({
  selector: "app-language-toggle",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex rounded-lg border border-line overflow-hidden text-xs font-semibold">
      @for (l of langs; track l.code) {
        <button
          (click)="i18n.setLang(l.code)"
          [class]="
            'px-2 py-1.5 transition-colors ' +
            (i18n.lang() === l.code ? 'bg-accent text-white' : 'bg-surface text-ink-dim hover:text-ink')
          "
          [attr.aria-pressed]="i18n.lang() === l.code"
        >
          {{ l.label }}
        </button>
      }
    </div>
  `,
})
export class LanguageToggle {
  protected readonly i18n = inject(LanguageService);
  protected readonly langs = LANGS;
}
