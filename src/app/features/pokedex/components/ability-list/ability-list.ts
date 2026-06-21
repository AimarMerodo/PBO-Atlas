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
    // No official Portuguese ability names: pt falls back to en via pick().
    return this.i18n.pick({ en: a.en, es: a.es, zh: a.zh });
  }

  protected text(a: AbilityInfo): string {
    return this.i18n.pick({ en: a.detail, es: a.detailEs, zh: a.detailZh, pt: a.detailPt }) || a.detail || a.textEn;
  }
}
