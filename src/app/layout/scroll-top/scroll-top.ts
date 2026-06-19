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
      class="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/90 text-ink shadow-lg shadow-black/40 backdrop-blur transition-all duration-200 hover:border-accent/60 hover:text-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
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
