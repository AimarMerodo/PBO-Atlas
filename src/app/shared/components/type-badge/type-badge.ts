import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import { TYPE_COLORS } from "@core/utils/colors";

@Component({
  selector: "app-type-badge",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-block rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
      [style.backgroundColor]="color()"
    >
      {{ label() }}
    </span>
  `,
})
export class TypeBadge {
  readonly type = input.required<string>();

  private readonly i18n = inject(LanguageService);
  protected readonly color = computed(() => TYPE_COLORS[this.type()] ?? "#9099a1");
  protected readonly label = computed(() => this.i18n.t(("type." + this.type()) as DictKey));
}
