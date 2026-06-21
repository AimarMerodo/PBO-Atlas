import { ChangeDetectionStrategy, Component, computed, effect, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { LucideSearch, LucideSparkles } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { Mount } from "@core/models/types";
import { slugifyName } from "@core/utils/slug";
import { GameModal } from "@shared/components/game-modal/game-modal";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { Pager } from "@shared/components/pager/pager";
import { pagedGallery } from "@features/game/paged-gallery";

const PAGE_SIZE = 48;

type MountGroup = "land" | "surf" | "others";

const GROUPS: { key: MountGroup; label: DictKey }[] = [
  { key: "land", label: "mounts.land" },
  { key: "surf", label: "mounts.surf" },
  { key: "others", label: "mounts.others" },
];

const groupOf = (type: string): MountGroup =>
  type === "LAND_POKEMON" ? "land" : type === "SURF_POKEMON" ? "surf" : "others";

/** Mount gallery, searchable and filterable by group / shiny. */
@Component({
  selector: "app-mounts-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSearch, LucideSparkles, GameModal, ItemIcon, Pager],
  templateUrl: "./mounts-page.html",
})
export class MountsPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  private readonly mountsRes = resource({ loader: () => this.data.mounts() });

  protected readonly groups = GROUPS;
  protected readonly group = signal<MountGroup | null>(null);
  protected readonly onlyShiny = signal(false);

  protected readonly mounts = computed(() => this.mountsRes.value() ?? null);

  private readonly gallery = pagedGallery<Mount>({
    source: this.mounts,
    pageSize: PAGE_SIZE,
    key: "mount",
    slugOf: (m) => slugifyName(m.name),
    filter: (m, q) => {
      const group = this.group();
      if (group && groupOf(m.type) !== group) return false;
      if (q && !m.name.toLowerCase().includes(q) && !this.i18n.localName(m).toLowerCase().includes(q)) return false;
      if (this.onlyShiny() && !/shiny/i.test(m.name)) return false;
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

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({ name: "description", content: "Every mount in Pokemon Blaze Online." });
    effect(() => title.setTitle(`${this.i18n.t("mounts.title")} | PBO Atlas`));
  }

  protected groupLabel(type: string): string {
    return this.i18n.t(GROUPS.find((g) => g.key === groupOf(type))!.label);
  }

  protected toggleGroup(key: MountGroup): void {
    this.group.update((g) => (g === key ? null : key));
    this.page.set(1);
  }

  protected toggleShiny(): void {
    this.onlyShiny.update((v) => !v);
    this.page.set(1);
  }
}
