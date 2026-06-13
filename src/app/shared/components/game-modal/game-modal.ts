import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { LucideX } from "@lucide/angular";
import type { AtlasIcon } from "@core/models/types";
import { ItemIcon } from "@shared/components/item-icon/item-icon";

/** Generic detail dialog for game entities: large atlas icon, title, badge and projected content. */
@Component({
  selector: "app-game-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideX, ItemIcon],
  templateUrl: "./game-modal.html",
})
export class GameModal {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly badge = input<string | null>(null);
  readonly icon = input.required<AtlasIcon | null>();
  readonly closed = output<void>();
}
