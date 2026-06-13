import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideArrowRight } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { EvoStage } from "@core/models/types";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

/** Evolution line with large artwork cards and localized trigger pills. */
@Component({
  selector: "app-evolution-line",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideArrowRight, TypeBadge],
  templateUrl: "./evolution-line.html",
})
export class EvolutionLine {
  readonly stages = input.required<EvoStage[]>();
  readonly current = input.required<string>();

  private readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  /** Warm the cache on hover so clicking an evolution navigates instantly. */
  protected preload(slug: string): void {
    void this.data.pokemon(slug);
  }

  /** Localize PokeAPI-derived trigger strings like "level 16", "use Thunder Stone, day". */
  protected triggerLabel(trigger: string): string {
    const t = (key: string) => this.i18n.t(key as DictKey);
    return trigger
      .split(", ")
      .map((part) => {
        let m = part.match(/^level (\d+)$/i);
        if (m) return `${t("evo.level")} ${m[1]}`;
        m = part.match(/^use (.+)$/i);
        if (m) return `${t("evo.use")} ${m[1]}`;
        m = part.match(/^hold (.+)$/i);
        if (m) return `${t("evo.hold")} ${m[1]}`;
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

  protected dexNo(id: number): string {
    return String(id).padStart(3, "0");
  }
}
