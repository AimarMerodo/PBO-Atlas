import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideArrowRight } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { EvoStage } from "@core/models/types";
import { pad } from "@core/utils/format";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

/** Evolution tree: base on the left, branches (Eevee, Wurmple, Slowpoke…) stacked
 *  and aligned to the right. Falls back to a linear chain for legacy untreed data. */
@Component({
  selector: "app-evolution-line",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, LucideArrowRight, ItemIcon, TypeBadge],
  templateUrl: "./evolution-line.html",
})
export class EvolutionLine {
  readonly stages = input.required<EvoStage[]>();
  readonly current = input.required<string>();

  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  /** Build the parent→children map + roots from the flat stage list. */
  private readonly tree = computed(() => {
    const list = this.stages();
    const children = new Map<string, EvoStage[]>();
    const add = (parent: string, s: EvoStage) => children.set(parent, [...(children.get(parent) ?? []), s]);
    // Patched data carries `from`; legacy data doesn't → treat it as one linear chain.
    if (list.some((s) => s.from !== undefined)) {
      const roots = list.filter((s) => !s.from);
      for (const s of list) if (s.from) add(s.from, s);
      return { roots, children };
    }
    for (let i = 1; i < list.length; i++) add(list[i - 1].slug, list[i]);
    return { roots: list.slice(0, 1), children };
  });

  protected roots(): EvoStage[] {
    return this.tree().roots;
  }
  protected childrenOf(slug: string): EvoStage[] {
    return this.tree().children.get(slug) ?? [];
  }

  /** Many final evolutions (Eevee's 8) → lay them out as a compact grid instead
   *  of a tall vertical stack. Nested/small branches keep the stacked layout. */
  protected isLeafFan(slug: string): boolean {
    const kids = this.childrenOf(slug);
    return kids.length >= 4 && kids.every((k) => this.childrenOf(k.slug).length === 0);
  }

  /** Warm the cache on hover so clicking an evolution navigates instantly. */
  protected preload(slug: string): void {
    void this.data.pokemon(slug);
  }

  /** Localize PokeAPI-derived trigger strings like "level 16", "use Thunder Stone, day".
   *  Item names in use/hold parts are dropped when they render as a clickable chip. */
  protected triggerLabel(stage: EvoStage): string {
    const t = (key: string) => this.i18n.t(key as DictKey);
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const chip = (name: string) => (stage.triggerItems ?? []).some((i) => norm(i.name) === norm(name));
    return (stage.trigger ?? "")
      .split(", ")
      .map((part) => {
        let m = part.match(/^level (\d+)$/i);
        if (m) return `${t("evo.level")} ${m[1]}`;
        m = part.match(/^use (.+)$/i);
        if (m) return chip(m[1]) ? t("evo.use") : `${t("evo.use")} ${m[1]}`;
        m = part.match(/^hold (.+)$/i);
        if (m) return chip(m[1]) ? t("evo.hold") : `${t("evo.hold")} ${m[1]}`;
        m = part.match(/^knows (.+)$/i);
        if (m) return `${t("evo.knows")} ${m[1]}`;
        m = part.match(/^at (.+)$/i);
        if (m) return `${t("evo.at")} ${m[1]}`;
        if (/^high friendship$/i.test(part)) return t("evo.friendship");
        if (/^trade$/i.test(part)) return t("evo.trade");
        if (/^day$/i.test(part)) return t("evo.day");
        if (/^night$/i.test(part)) return t("evo.night");
        if (/^special$/i.test(part)) return t("evo.special");
        return part;
      })
      .join(" · ");
  }

  protected readonly pad = pad;
}
