import { ChangeDetectionStrategy, Component, computed, effect, inject, resource } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { LucideTrendingDown, LucideTrendingUp } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { Nature, StatName } from "@core/models/types";

/** All 25 natures and which stats they raise or lower, sorted by localized name. */
@Component({
  selector: "app-natures-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideTrendingDown, LucideTrendingUp],
  templateUrl: "./natures-page.html",
})
export class NaturesPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  private readonly naturesRes = resource({ loader: () => this.data.natures() });

  protected readonly sorted = computed(() => {
    const natures = this.naturesRes.value();
    return natures ? [...natures].sort((a, b) => this.name(a).localeCompare(this.name(b))) : null;
  });

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "All 25 natures in Pokemon Blaze Online and which stats they raise or lower.",
    });
    effect(() => title.setTitle(`${this.i18n.t("natures.title")} | PBO Atlas`));
  }

  protected name(n: Nature): string {
    return this.i18n.pick({ en: n.name, es: n.es, zh: n.zh, pt: n.pt });
  }

  protected statLabel(stat: StatName): string {
    return this.i18n.t(`stat.${stat}` as DictKey);
  }
}
