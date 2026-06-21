import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, input, signal } from "@angular/core";
import { DecimalPipe } from "@angular/common";

/**
 * Counts up from 0 to [value] when scrolled into view (browser only).
 * Renders 0 on the server; the binding keeps hydration clean.
 * Usage: <app-count-up [value]="1329" />
 */
@Component({
  selector: "app-count-up",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: "{{ display() | number }}",
})
export class CountUp {
  readonly value = input.required<number>();

  protected readonly display = signal(0);

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement;
    // afterNextRender runs in the browser only — no SSR/hydration interference.
    afterNextRender(() => {
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          this.run();
        },
        { threshold: 0.4 },
      );
      io.observe(el);
    });
  }

  // ponytail: one-shot observer self-disconnects and the rAF self-terminates at the
  // target, so no OnDestroy cleanup — a mid-tween destroy just lets the last frame run.
  private run(): void {
    const target = this.value();
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1300);
      this.display.set(Math.round(target * (1 - Math.pow(1 - t, 3)))); // easeOutCubic
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
