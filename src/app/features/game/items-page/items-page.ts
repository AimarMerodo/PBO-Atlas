import { ChangeDetectionStrategy, Component, computed, effect, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { GameItem } from "@core/models/types";
import { itemCategoryKey } from "@core/utils/item-category";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { Pager } from "@shared/components/pager/pager";
import { ItemModal } from "@features/game/item-modal/item-modal";
import { replaceQueryParam } from "@features/game/replace-query-param";

const PAGE_SIZE = 48;

/** Item dex: full item list, searchable and filterable by category. */
@Component({
  selector: "app-items-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSearch, ItemIcon, Pager, ItemModal],
  templateUrl: "./items-page.html",
})
export class ItemsPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);
  private readonly initialSlug = inject(ActivatedRoute).snapshot.queryParamMap.get("item");

  private readonly itemsRes = resource({ loader: () => this.data.items() });

  protected readonly query = signal("");
  protected readonly category = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly selected = signal<GameItem | null>(null);

  protected readonly items = computed(() => this.itemsRes.value()?.items ?? null);

  protected readonly categories = computed(() => {
    const items = this.items();
    return items ? [...new Set(items.map((i) => i.category))].sort() : [];
  });

  protected readonly filtered = computed(() => {
    const items = this.items() ?? [];
    const q = this.query().trim().toLowerCase();
    const category = this.category();
    return items.filter((i) => {
      if (q && !i.name.toLowerCase().includes(q) && !this.localName(i).toLowerCase().includes(q)) return false;
      if (category && i.category !== category) return false;
      return true;
    });
  });

  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  protected readonly current = computed(() => Math.min(this.page(), this.pageCount()));
  protected readonly visible = computed(() =>
    this.filtered().slice((this.current() - 1) * PAGE_SIZE, this.current() * PAGE_SIZE),
  );

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "Every item in Pokemon Blaze Online with icons and descriptions.",
    });
    effect(() => title.setTitle(`${this.i18n.t("items.title")} | PBO Atlas`));

    // Shareable deep link: /items?item=<slug> opens the modal once the list loads.
    effect(() => {
      const items = this.items();
      if (items && this.initialSlug) {
        this.selected.set(items.find((i) => i.slug === this.initialSlug) ?? null);
      }
    });
  }

  protected localName(i: GameItem): string {
    return this.i18n.pick({ en: i.name, es: i.es, zh: i.zh, pt: i.pt });
  }

  protected categoryLabel(category: string): string {
    const key = itemCategoryKey(category);
    return key ? this.i18n.t(key) : category;
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }

  protected onCategory(value: string): void {
    this.category.set(value || null);
    this.page.set(1);
  }

  protected select(item: GameItem | null): void {
    this.selected.set(item);
    replaceQueryParam("item", item?.slug ?? null);
  }
}
