import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, effect, inject, signal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Meta, Title } from "@angular/platform-browser";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import { ALL_TYPES, attackProfile, defenseProfile, type AttackProfile, type DefenseProfile } from "@core/utils/type-chart";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

type Mode = "defense" | "attack";

const DEF_ROWS: { key: keyof DefenseProfile; label: DictKey; accent: string }[] = [
  { key: "x4", label: "eff.x4", accent: "#ef4444" },
  { key: "x2", label: "eff.x2", accent: "#f97316" },
  { key: "half", label: "eff.half", accent: "#22c55e" },
  { key: "quarter", label: "eff.quarter", accent: "#10b981" },
  { key: "immune", label: "eff.immune", accent: "#a1a1aa" },
];
const ATK_ROWS: { key: keyof AttackProfile; label: DictKey; accent: string }[] = [
  { key: "x2", label: "eff.superEff", accent: "#f97316" },
  { key: "half", label: "eff.notVeryEff", accent: "#22c55e" },
  { key: "immune", label: "eff.noEffect", accent: "#a1a1aa" },
];

/** Interactive type-matchup calculator: a defending combo's weaknesses/resistances,
 *  or an attacking type's coverage. Pure client-side over the Gen 6+ chart. */
@Component({
  selector: "app-type-calculator",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeBadge],
  templateUrl: "./type-calculator.html",
})
export class TypeCalculatorComponent {
  protected readonly i18n = inject(LanguageService);
  protected readonly allTypes = ALL_TYPES;
  protected readonly mode = signal<Mode>("defense");
  protected readonly selected = signal<string[]>([]);

  protected setMode(m: Mode): void {
    this.mode.set(m);
    if (m === "attack") this.selected.update((s) => s.slice(0, 1)); // attack is single-type
  }

  protected isSelected(t: string): boolean {
    return this.selected().includes(t);
  }

  protected toggle(t: string): void {
    if (this.mode() === "attack") {
      this.selected.set([t]);
      return;
    }
    // Defense: up to 2 types; adding a 3rd drops the oldest.
    this.selected.update((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t].slice(-2)));
  }

  protected clear(): void {
    this.selected.set([]);
  }

  /** Result rows for the current mode + selection (empty groups filtered out). */
  protected readonly rows = computed(() => {
    const sel = this.selected();
    if (!sel.length) return [];
    if (this.mode() === "attack") {
      const p = attackProfile(sel[0]);
      return ATK_ROWS.map((r) => ({ ...r, types: p[r.key] })).filter((r) => r.types.length > 0);
    }
    const p = defenseProfile(sel);
    return DEF_ROWS.map((r) => ({ ...r, types: p[r.key] })).filter((r) => r.types.length > 0);
  });

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "Pokemon type matchup calculator — weaknesses, resistances and offensive coverage.",
    });
    effect(() => title.setTitle(`${this.i18n.t("typeCalc.title")} | PBO Atlas`));

    if (this.isBrowser) {
      // Shareable deep link: /type-calculator?mode=attack&types=water,ground
      const p = new URLSearchParams(location.search);
      if (p.get("mode") === "attack") this.mode.set("attack");
      const t = (p.get("types") ?? "").split(",").map((s) => s.trim()).filter((s) => ALL_TYPES.includes(s));
      if (t.length) this.selected.set(t.slice(0, this.mode() === "attack" ? 1 : 2));
      // Keep the URL in sync (no navigation) so the current matchup is shareable.
      effect(() => {
        const sel = this.selected();
        const url = new URL(location.href);
        url.searchParams.set("mode", this.mode());
        if (sel.length) url.searchParams.set("types", sel.join(","));
        else url.searchParams.delete("types");
        history.replaceState(null, "", url.toString());
      });
    }
  }
}
