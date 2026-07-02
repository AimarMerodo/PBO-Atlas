import { ChangeDetectionStrategy, Component, computed, effect, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { GameItem } from "@core/models/types";
import { itemCategoryKey } from "@core/utils/item-category";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { Pager } from "@shared/components/pager/pager";
import { ItemModal } from "@features/game/item-modal/item-modal";
import { pagedGallery } from "@features/game/paged-gallery";

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

  private readonly itemsRes = resource({ loader: () => this.data.items() });
  // Heavy descriptions/sources: fetched only once a modal is first opened.
  private readonly detailsRes = resource({
    params: () => (this.selected() ? true : undefined),
    loader: () => this.data.itemDetails(),
  });

  protected readonly category = signal<string | null>(null);

  protected readonly items = computed(() => this.itemsRes.value()?.items ?? null);

  private readonly gallery = pagedGallery<GameItem>({
    source: this.items,
    pageSize: PAGE_SIZE,
    key: "item",
    slugOf: (i) => i.slug,
    filter: (i, q) => {
      if (q && !i.name.toLowerCase().includes(q) && !this.i18n.localName(i).toLowerCase().includes(q)) return false;
      const category = this.category();
      if (category && i.category !== category) return false;
      return true;
    },
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

  /** Selected item merged with its lazily-loaded description/sources for the modal. */
  protected readonly selectedItem = computed(() => {
    const sel = this.selected();
    if (!sel) return null;
    const detail = this.detailsRes.value()?.[sel.slug];
    return detail ? { ...sel, ...detail } : sel;
  });

  protected readonly categories = computed(() => {
    const items = this.items();
    return items ? [...new Set(items.map((i) => i.category))].sort() : [];
  });

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "Every item in Pokemon Blaze Online with icons and descriptions.",
    });
    effect(() => title.setTitle(`${this.i18n.t("items.title")} | PBO Atlas`));
  }

  protected categoryLabel(category: string): string {
    const key = itemCategoryKey(category);
    return key ? this.i18n.t(key) : category;
  }

  protected onCategory(value: string): void {
    this.category.set(value || null);
    this.page.set(1);
  }
}
