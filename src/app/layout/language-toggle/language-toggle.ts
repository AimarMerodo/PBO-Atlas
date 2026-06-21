import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from "@angular/core";
import { LucideCheck, LucideChevronDown } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import { LANGS, type Lang } from "@core/i18n/dictionaries";
import { DismissOutside } from "@shared/directives/dismiss-outside";

@Component({
  selector: "app-language-toggle",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The active language comes from localStorage (browser-only), so the
  // prerendered HTML (always EN) never matches; skip hydration to re-render.
  host: { ngSkipHydration: "true" },
  imports: [LucideCheck, LucideChevronDown, DismissOutside],
  template: `
    <div class="relative" (dismissOutside)="open.set(false)">
      <button
        type="button"
        (click)="$event.stopPropagation(); toggle()"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        [attr.aria-label]="i18n.t('nav.language')"
        class="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5 text-xs font-semibold text-ink-dim transition-colors hover:text-ink"
      >
        <img [src]="flag[current().code]" alt="" class="h-5 w-5 rounded-full object-cover ring-1 ring-line" />
        <span class="text-ink">{{ current().label }}</span>
        <svg lucideChevronDown class="h-3.5 w-3.5 transition-transform" [class.rotate-180]="open()" aria-hidden="true"></svg>
      </button>

      @if (open()) {
        <ul
          data-modal-content
          class="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-2xl"
          role="listbox"
        >
          @for (l of langs; track l.code) {
            <li>
              <button
                type="button"
                (click)="select(l.code)"
                role="option"
                [attr.aria-selected]="l.code === i18n.lang()"
                class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2"
                [class.text-ink]="l.code === i18n.lang()"
                [class.text-ink-dim]="l.code !== i18n.lang()"
              >
                <img [src]="flag[l.code]" alt="" class="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-line" />
                <span class="font-semibold">{{ l.label }}</span>
                <span class="truncate text-xs text-ink-dim">{{ nativeName[l.code] }}</span>
                @if (l.code === i18n.lang()) {
                  <svg lucideCheck class="ml-auto h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true"></svg>
                }
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class LanguageToggle {
  protected readonly i18n = inject(LanguageService);
  protected readonly langs = LANGS;
  protected readonly open = signal(false);

  protected readonly flag: Record<Lang, string> = {
    en: "/flags/en.svg",
    es: "/flags/es.svg",
    zh: "/flags/zh.svg",
    pt: "/flags/pt.svg",
  };
  protected readonly nativeName: Record<Lang, string> = {
    en: "English",
    es: "Español",
    zh: "中文",
    pt: "Português",
  };

  protected readonly current = computed(() => this.langs.find((l) => l.code === this.i18n.lang()) ?? this.langs[0]);

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected select(code: Lang): void {
    this.i18n.setLang(code);
    this.open.set(false);
  }

  @HostListener("document:keydown.escape")
  protected onEscape(): void {
    this.open.set(false);
  }
}
