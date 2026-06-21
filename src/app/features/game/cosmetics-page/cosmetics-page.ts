import { ChangeDetectionStrategy, Component, computed, effect, inject, resource } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { LucideShirt } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { CosmeticBundle } from "@core/models/types";
import { GameModal } from "@shared/components/game-modal/game-modal";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { deepLinkSelection } from "@features/game/paged-gallery";

/** Cosmetic bundle gallery: cards with piece icons, click for the detail modal. */
@Component({
  selector: "app-cosmetics-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideShirt, GameModal, ItemIcon],
  templateUrl: "./cosmetics-page.html",
})
export class CosmeticsPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  private readonly bundlesRes = resource({ loader: () => this.data.cosmetics() });

  protected readonly bundles = computed(() => this.bundlesRes.value() ?? null);

  private readonly link = deepLinkSelection<CosmeticBundle>(this.bundles, "bundle", (b) => b.slug);
  protected readonly selected = this.link.selected;
  protected readonly select = this.link.select;

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "Cosmetic costume bundles available in Pokemon Blaze Online.",
    });
    effect(() => title.setTitle(`${this.i18n.t("cosmetics.title")} | PBO Atlas`));
  }

  protected prettyName(name: string): string {
    return name.replace(/ Bundle| Costume/g, "");
  }
}
