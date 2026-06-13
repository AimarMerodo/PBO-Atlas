import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LanguageService } from "@core/i18n/language.service";
import type { GameItem } from "@core/models/types";
import { itemCategoryKey } from "@core/utils/item-category";
import { GameModal } from "@shared/components/game-modal/game-modal";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

/**
 * Item detail dialog: large icon, localized names, and cross-references
 * (move taught by TMs, pokemon evolved by stones).
 */
@Component({
  selector: "app-item-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GameModal, TypeBadge],
  templateUrl: "./item-modal.html",
})
export class ItemModal {
  readonly item = input.required<GameItem>();
  readonly closed = output<void>();

  protected readonly i18n = inject(LanguageService);

  protected readonly localName = computed(() => {
    const i = this.item();
    return this.i18n.pick({ en: i.name, es: i.es, zh: i.zh, pt: i.pt });
  });

  protected readonly localDescription = computed(() => {
    const i = this.item();
    return this.i18n.pick({ en: i.description, es: i.descEs, zh: i.descZh, pt: i.descPt });
  });

  protected readonly categoryLabel = computed(() => {
    const key = itemCategoryKey(this.item().category);
    return key ? this.i18n.t(key) : this.item().category;
  });

  protected readonly teachesName = computed(() => {
    const teaches = this.item().teaches;
    return teaches ? this.i18n.pick({ en: teaches.name, es: teaches.es, zh: teaches.zh, pt: teaches.pt }) : "";
  });
}
