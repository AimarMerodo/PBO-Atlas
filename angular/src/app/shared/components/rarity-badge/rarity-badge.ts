import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { RARITY_COLORS } from "@core/utils/colors";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";

@Component({
  selector: "app-rarity-badge",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      [style.backgroundColor]="color() + '26'"
      [style.color]="color()"
      [style.border]="'1px solid ' + color() + '59'"
    >
      {{ label() }}
    </span>
  `,
})
export class RarityBadge {
  readonly rarity = input.required<string>();
  private readonly i18n = inject(LanguageService);

  protected readonly color = computed(() => RARITY_COLORS[this.rarity()] ?? "#9099a1");
  protected readonly label = computed(() => {
    const key = "rarity." + this.rarity();
    const value = this.i18n.t(key as DictKey);
    return value === key ? this.rarity() : value;
  });
}
