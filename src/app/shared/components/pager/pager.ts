import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core";
import { LucideChevronLeft, LucideChevronRight } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";

/** Numbered pagination: first, last and a sliding window around the current page. */
@Component({
  selector: "app-pager",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideChevronLeft, LucideChevronRight],
  templateUrl: "./pager.html",
})
export class Pager {
  readonly current = input.required<number>();
  readonly pageCount = input.required<number>();
  readonly numbered = input(true);
  readonly pageChange = output<number>();

  protected readonly i18n = inject(LanguageService);

  protected readonly pages = computed<(number | "...")[]>(() => {
    const total = this.pageCount();
    const current = this.current();
    if (!this.numbered()) return [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const wanted = [...new Set([1, total, current - 1, current, current + 1])]
      .filter((p) => p >= 1 && p <= total)
      .sort((a, b) => a - b);
    const out: (number | "...")[] = [];
    let prev = 0;
    for (const p of wanted) {
      if (p - prev > 1) out.push("...");
      out.push(p);
      prev = p;
    }
    return out;
  });

  protected go(page: number): void {
    if (page >= 1 && page <= this.pageCount()) this.pageChange.emit(page);
  }
}
