import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { StatName } from "@core/models/types";

const STATS: StatName[] = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
const MAX_STAT = 255;

/** Base stat bars with color-coded values and the total row. */
@Component({
  selector: "app-stat-bars",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./stat-bars.html",
})
export class StatBars {
  readonly stats = input.required<Record<StatName, number>>();

  private readonly i18n = inject(LanguageService);
  protected readonly statNames = STATS;

  protected readonly total = computed(() => STATS.reduce((n, s) => n + (this.stats()[s] ?? 0), 0));

  protected value(stat: StatName): number {
    return this.stats()[stat] ?? 0;
  }

  protected width(value: number): number {
    return Math.min((value / MAX_STAT) * 100, 100);
  }

  protected color(value: number): string {
    if (value < 50) return "#ef4444";
    if (value < 80) return "#f59e0b";
    if (value < 110) return "#84cc16";
    return "#22c55e";
  }

  protected label(stat: StatName): string {
    return this.i18n.t(("stat." + stat) as DictKey);
  }
}
