import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import { defenseProfile, type DefenseProfile } from "@core/utils/type-chart";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

const ROWS: { key: keyof DefenseProfile; label: DictKey; accent: string }[] = [
  { key: "x4", label: "eff.x4", accent: "#ef4444" },
  { key: "x2", label: "eff.x2", accent: "#f97316" },
  { key: "half", label: "eff.half", accent: "#22c55e" },
  { key: "quarter", label: "eff.quarter", accent: "#10b981" },
  { key: "immune", label: "eff.immune", accent: "#a1a1aa" },
];

/**
 * Defensive type matchup table: what hits this pokemon for x4/x2, what it
 * resists and what it's immune to.
 */
@Component({
  selector: "app-type-effectiveness",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeBadge],
  templateUrl: "./type-effectiveness.html",
})
export class TypeEffectiveness {
  readonly types = input.required<string[]>();

  protected readonly i18n = inject(LanguageService);

  protected readonly rows = computed(() => {
    const profile = defenseProfile(this.types());
    return ROWS.map((row) => ({ ...row, types: profile[row.key] })).filter((row) => row.types.length > 0);
  });
}
