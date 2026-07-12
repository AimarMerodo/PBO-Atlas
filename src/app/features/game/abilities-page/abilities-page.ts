import { ChangeDetectionStrategy, Component, computed, effect, inject, resource } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { AbilityDexEntry } from "@core/models/types";
import { Pager } from "@shared/components/pager/pager";
import { AbilityModal } from "@features/game/ability-modal/ability-modal";
import { pagedGallery } from "@features/game/paged-gallery";

const PAGE_SIZE = 40;

/** Ability dex: every ability, searchable, with a modal listing which pokemon have it. */
@Component({
  selector: "app-abilities-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSearch, Pager, AbilityModal],
  templateUrl: "./abilities-page.html",
})
export class AbilitiesPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  private readonly res = resource({ loader: () => this.data.abilitiesList() });
  protected readonly abilities = computed(() => this.res.value() ?? null);

  private readonly gallery = pagedGallery<AbilityDexEntry>({
    source: this.abilities,
    pageSize: PAGE_SIZE,
    key: "ability",
    slugOf: (a) => a.slug,
    filter: (a, q) => !q || this.abilityName(a).toLowerCase().includes(q) || a.en.toLowerCase().includes(q),
  });

  protected readonly query = this.gallery.query;
  protected readonly page = this.gallery.page;
  protected readonly selected = this.gallery.selected;
  protected readonly filtered = this.gallery.filtered;
  protected readonly pageCount = this.gallery.pageCount;
  protected readonly current = this.gallery.current;
  protected readonly visible = this.gallery.visible;
  protected readonly onQuery = this.gallery.onQuery;
  protected readonly select = this.gallery.select;

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "Every ability in Pokemon Blaze Online with its effect and which Pokemon have it.",
    });
    effect(() => title.setTitle(`${this.i18n.t("abilities.dexTitle")} | PBO Atlas`));
  }

  protected abilityName(a: AbilityDexEntry): string {
    return this.i18n.pick({ en: a.en, es: a.es, zh: a.zh });
  }
  protected abilityText(a: AbilityDexEntry): string {
    return this.i18n.pick({ en: a.textEn, es: a.textEs }) || a.textEn || "";
  }
}
