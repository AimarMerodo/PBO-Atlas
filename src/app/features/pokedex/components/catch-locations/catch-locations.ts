import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  LucideCircleArrowUp,
  LucideHammer,
  LucidePickaxe,
  LucideRadar,
  LucideScrollText,
  LucideSparkles,
  LucideStore,
  LucideSwords,
  LucideTrophy,
} from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { Acquisition, Encounter } from "@core/models/types";
import { RARITY_ORDER } from "@core/utils/colors";
import { levelLabel as formatLevel } from "@core/utils/format";
import { MethodIcon } from "@shared/components/method-icon/method-icon";
import { RarityBadge } from "@shared/components/rarity-badge/rarity-badge";
import { TimeIcon } from "@shared/components/time-icon/time-icon";

/** "Where to catch" + "How to obtain" panel on the pokemon detail page. */
@Component({
  selector: "app-catch-locations",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MethodIcon,
    RarityBadge,
    TimeIcon,
    LucideStore,
    LucideSparkles,
    LucideTrophy,
    LucideHammer,
    LucidePickaxe,
    LucideSwords,
    LucideScrollText,
    LucideRadar,
    LucideCircleArrowUp,
  ],
  templateUrl: "./catch-locations.html",
})
export class CatchLocations {
  readonly encounters = input.required<Encounter[]>();
  readonly catchableAncestors = input.required<{ slug: string; name: string }[]>();
  readonly obtain = input<Acquisition[]>([]);

  protected readonly i18n = inject(LanguageService);

  protected readonly sorted = computed(() =>
    [...this.encounters()].sort(
      (a, b) =>
        a.regionName.localeCompare(b.regionName) ||
        (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9) ||
        a.locationName.localeCompare(b.locationName)
    )
  );

  /** Accent colour per obtain method (matches the icon). */
  private readonly TINTS: Record<string, string> = {
    store: "#a78bfa",
    event: "#f472b6",
    ranked: "#fbbf24",
    craft: "#fb923c",
    mining: "#94a3b8",
    boss: "#f87171",
    quest: "#34d399",
    roaming: "#38bdf8",
    evolution: "#22d3ee",
  };

  protected tint(method: string): string {
    return this.TINTS[method] ?? "#9099a1";
  }

  protected methodLabel(method: string): string {
    const value = this.i18n.t(`obtain.${method}` as never);
    return value === `obtain.${method}` ? method : value;
  }

  protected levelLabel(e: Encounter): string {
    if (!e.level) return "—";
    return formatLevel(e.level.min, e.level.max);
  }
}
