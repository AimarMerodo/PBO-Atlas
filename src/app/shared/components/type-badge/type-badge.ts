import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { TYPE_COLORS } from "@core/utils/colors";

@Component({
  selector: "app-type-badge",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-block rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
      [style.backgroundColor]="color()"
    >
      {{ type() }}
    </span>
  `,
})
export class TypeBadge {
  readonly type = input.required<string>();
  protected readonly color = computed(() => TYPE_COLORS[this.type()] ?? "#9099a1");
}
