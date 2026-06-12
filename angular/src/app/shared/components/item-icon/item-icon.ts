import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { AtlasIcon } from "@core/models/types";

/** Renders a game item icon by cropping its atlas page with CSS. */
@Component({
  selector: "app-item-icon",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (icon(); as ic) {
      <div aria-hidden="true" [style]="style()"></div>
    } @else {
      <div [style.width.px]="size()" [style.height.px]="size()" class="rounded bg-surface-2" aria-hidden="true"></div>
    }
  `,
})
export class ItemIcon {
  readonly icon = input.required<AtlasIcon | null>();
  readonly size = input(40);

  protected readonly style = computed(() => {
    const ic = this.icon();
    const size = this.size();
    if (!ic || !ic.w) return {};
    const s = size / Math.max(ic.w, ic.h);
    return {
      width: `${size}px`,
      height: `${size}px`,
      "background-image": `url(/items/${ic.page})`,
      "background-position": `${-ic.x * s}px ${-ic.y * s}px`,
      "background-size": `${ic.pageW * s}px ${ic.pageH * s}px`,
      "background-repeat": "no-repeat",
    };
  });
}
