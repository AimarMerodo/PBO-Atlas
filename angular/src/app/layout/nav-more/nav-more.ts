import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideChevronDown } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";

const LINKS: { href: string; label: DictKey }[] = [
  { href: "/items", label: "nav.items" },
  { href: "/natures", label: "nav.natures" },
  { href: "/mounts", label: "nav.mounts" },
  { href: "/cosmetics", label: "nav.cosmetics" },
  { href: "/feedback", label: "nav.feedback" },
];

@Component({
  selector: "app-nav-more",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideChevronDown],
  template: `
    <div class="relative">
      <button
        (click)="open.set(!open())"
        [attr.aria-expanded]="open()"
        class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-ink-dim hover:bg-surface hover:text-ink transition-colors"
      >
        {{ i18n.t("nav.more") }}
        <svg
          lucideChevronDown
          [class]="'h-3.5 w-3.5 transition-transform ' + (open() ? 'rotate-180' : '')"
          aria-hidden="true"
        ></svg>
      </button>
      @if (open()) {
        <div class="absolute left-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          @for (l of links; track l.href) {
            <a
              [routerLink]="l.href"
              (click)="open.set(false)"
              class="block px-4 py-2 text-sm text-ink-dim hover:bg-surface-2 hover:text-ink transition-colors"
            >
              {{ i18n.t(l.label) }}
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class NavMore {
  protected readonly i18n = inject(LanguageService);
  protected readonly links = LINKS;
  protected readonly open = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }
}
