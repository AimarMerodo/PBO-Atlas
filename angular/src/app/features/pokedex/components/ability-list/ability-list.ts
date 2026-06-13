import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { LucideEye, LucideEyeOff } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { AbilityInfo } from "@core/models/types";

/** Abilities with localized name, hidden badge and description. */
@Component({
  selector: "app-ability-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideEye, LucideEyeOff],
  templateUrl: "./ability-list.html",
})
export class AbilityList {
  readonly abilities = input.required<AbilityInfo[]>();

  protected readonly i18n = inject(LanguageService);

  protected name(a: AbilityInfo): string {
    const lang = this.i18n.lang();
    if (lang === "es") return a.es;
    if (lang === "zh") return a.zh || a.en;
    return a.en; // en + pt (no official Portuguese ability names)
  }

  protected text(a: AbilityInfo): string {
    const lang = this.i18n.lang();
    const detail =
      lang === "es" ? a.detailEs : lang === "zh" ? a.detailZh : lang === "pt" ? a.detailPt : a.detail;
    return detail || a.detail || a.textEn;
  }
}
