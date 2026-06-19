import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from "@angular/core";
import { LucideArrowUp } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";

/**
 * Floating "back to top" button shown on every page once you scroll down a bit.
 * Lives in the app shell so it's global. The scroll listener is attached only in
 * the browser (afterNextRender) so it's a no-op during static prerendering, and
 * it flips a signal that drives a fade/slide via CSS classes.
 */
@Component({
  selector: "app-scroll-top",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideArrowUp],
  template: `
    <button
      type="button"
      (click)="toTop()"
      [attr.aria-label]="i18n.t('common.scrollTop')"
      [attr.tabindex]="visible() ? 0 : -1"
      [attr.aria-hidden]="!visible()"
      [class.pointer-events-none]="!visible()"
      [class.opacity-0]="!visible()"
      [class.translate-y-3]="!visible()"
      class="fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-xl shadow-accent/40 ring-1 ring-black/15 transition-all duration-200 hover:scale-105 hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <svg lucideArrowUp class="h-5 w-5" aria-hidden="true"></svg>
    </button>
  `,
})
export class ScrollTop {
  protected readonly i18n = inject(LanguageService);
  protected readonly visible = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const onScroll = (): void => {
        const v = window.scrollY > 400;
        if (v !== this.visible()) this.visible.set(v);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      this.destroyRef.onDestroy(() => window.removeEventListener("scroll", onScroll));
    });
  }

  protected toTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
