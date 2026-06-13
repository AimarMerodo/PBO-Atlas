import { ChangeDetectionStrategy, Component, computed, effect, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { LucideShirt } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { CosmeticBundle } from "@core/models/types";
import { GameModal } from "@shared/components/game-modal/game-modal";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { replaceQueryParam } from "@features/game/replace-query-param";

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
  private readonly initialSlug = inject(ActivatedRoute).snapshot.queryParamMap.get("bundle");

  private readonly bundlesRes = resource({ loader: () => this.data.cosmetics() });

  protected readonly bundles = computed(() => this.bundlesRes.value() ?? null);
  protected readonly selected = signal<CosmeticBundle | null>(null);

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "Cosmetic costume bundles available in Pokemon Blaze Online.",
    });
    effect(() => title.setTitle(`${this.i18n.t("cosmetics.title")} | PBO Atlas`));

    // Shareable deep link: /cosmetics?bundle=<slug> opens the modal once the list loads.
    effect(() => {
      const bundles = this.bundles();
      if (bundles && this.initialSlug) {
        this.selected.set(bundles.find((b) => b.slug === this.initialSlug) ?? null);
      }
    });
  }

  protected prettyName(name: string): string {
    return name.replace(/ Bundle| Costume/g, "");
  }

  protected pieceName(piece: CosmeticBundle["items"][number]): string {
    return this.i18n.pick({ en: piece.name, es: piece.es, zh: piece.zh, pt: piece.pt });
  }

  protected select(bundle: CosmeticBundle | null): void {
    this.selected.set(bundle);
    replaceQueryParam("bundle", bundle?.slug ?? null);
  }
}
