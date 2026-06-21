import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import { RARITY_ORDER } from "@core/utils/colors";
import { levelLabel } from "@core/utils/format";
import type { Spawn } from "@core/models/types";
import { RarityBadge } from "@shared/components/rarity-badge/rarity-badge";
import { TimeIcon } from "@shared/components/time-icon/time-icon";
import { MethodIcon } from "@shared/components/method-icon/method-icon";

const RARITY_FILTERS = ["common", "uncommon", "rare", "very-rare", "ultra-rare", "legendary"] as const;

/** Spawn table for one location with text/rarity/time/method filters. */
@Component({
  selector: "app-spawn-table",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Without this the host is display:inline, so its table overflows the host box
  // and the parent's space-y gap collapses (the "Source:" line glues to the table).
  host: { class: "block" },
  imports: [RouterLink, RarityBadge, TimeIcon, MethodIcon],
  templateUrl: "./spawn-table.html",
})
export class SpawnTableComponent {
  readonly spawns = input.required<Spawn[]>();

  protected readonly i18n = inject(LanguageService);
  protected readonly query = signal("");
  protected readonly rarity = signal<string | null>(null);
  protected readonly time = signal<string | null>(null);
  protected readonly method = signal<string | null>(null);

  protected readonly rarities = computed(() =>
    RARITY_FILTERS.filter((r) => this.spawns().some((s) => s.rarity === r)),
  );
  protected readonly times = computed(() => [...new Set(this.spawns().map((s) => s.time))]);
  protected readonly methods = computed(() => [...new Set(this.spawns().map((s) => s.method))]);

  protected readonly sorted = computed(() => {
    const query = this.query().trim().toLowerCase();
    const rarity = this.rarity();
    const time = this.time();
    const method = this.method();
    return this.spawns()
      .filter((s) => {
        if (query && !s.displayName.toLowerCase().includes(query)) return false;
        if (rarity && s.rarity !== rarity) return false;
        if (time && s.time !== time) return false;
        if (method && s.method !== method) return false;
        return true;
      })
      .sort(
        (a, b) =>
          (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9) ||
          a.displayName.localeCompare(b.displayName),
      );
  });

  protected chipClass(active: boolean): string {
    return `rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
      active ? "border-accent bg-accent/20 text-accent-soft" : "border-line bg-surface text-ink-dim hover:text-ink"
    }`;
  }

  protected label(prefix: "rarity" | "time" | "method", value: string): string {
    return this.i18n.t(`${prefix}.${value}` as DictKey);
  }

  protected levelLabel(s: Spawn): string {
    if (!s.level) return "—";
    return levelLabel(s.level.min, s.level.max);
  }

  protected evsLabel(s: Spawn): string {
    if (!s.evs.length) return "—";
    return s.evs.map((e) => `+${e.amount} ${this.i18n.t(`stat.${e.stat}` as DictKey)}`).join(", ");
  }
}
