import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject, input, signal } from "@angular/core";
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
export class CountUp implements OnDestroy {
  readonly value = input.required<number>();
  readonly duration = input(1300);

  private readonly el = inject(ElementRef<HTMLElement>).nativeElement;
  protected readonly display = signal(0);
  private observer?: IntersectionObserver;
  private raf = 0;

  constructor() {
    // afterNextRender runs in the browser only — no SSR/hydration interference.
    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            this.observer?.disconnect();
            this.run();
          }
        },
        { threshold: 0.4 },
      );
      this.observer.observe(this.el);
    });
  }

  private run(): void {
    const target = this.value();
    const dur = this.duration();
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      this.display.set(Math.round(target * eased));
      if (t < 1) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
