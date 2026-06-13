import { ChangeDetectionStrategy, Component, computed, effect, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { LucideSearch, LucideSparkles } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { Mount } from "@core/models/types";
import { slugifyName } from "@core/utils/slug";
import { GameModal } from "@shared/components/game-modal/game-modal";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { Pager } from "@shared/components/pager/pager";
import { replaceQueryParam } from "@features/game/replace-query-param";

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
  private readonly initialSlug = inject(ActivatedRoute).snapshot.queryParamMap.get("mount");

  private readonly mountsRes = resource({ loader: () => this.data.mounts() });

  protected readonly groups = GROUPS;
  protected readonly query = signal("");
  protected readonly group = signal<MountGroup | null>(null);
  protected readonly onlyShiny = signal(false);
  protected readonly page = signal(1);
  protected readonly selected = signal<Mount | null>(null);

  protected readonly mounts = computed(() => this.mountsRes.value() ?? null);

  protected readonly filtered = computed(() => {
    const mounts = this.mounts() ?? [];
    const q = this.query().trim().toLowerCase();
    const group = this.group();
    const onlyShiny = this.onlyShiny();
    return mounts.filter((m) => {
      if (group && groupOf(m.type) !== group) return false;
      if (q && !m.name.toLowerCase().includes(q) && !this.localName(m).toLowerCase().includes(q)) return false;
      if (onlyShiny && !/shiny/i.test(m.name)) return false;
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
    inject(Meta).updateTag({ name: "description", content: "Every mount in Pokemon Blaze Online." });
    effect(() => title.setTitle(`${this.i18n.t("mounts.title")} | PBO Atlas`));

    // Shareable deep link: /mounts?mount=<slug> opens the modal once the list loads.
    effect(() => {
      const mounts = this.mounts();
      if (mounts && this.initialSlug) {
        this.selected.set(mounts.find((m) => slugifyName(m.name) === this.initialSlug) ?? null);
      }
    });
  }

  protected localName(m: Mount): string {
    return this.i18n.pick({ en: m.name, es: m.es, zh: m.zh, pt: m.pt });
  }

  protected groupLabel(type: string): string {
    return this.i18n.t(GROUPS.find((g) => g.key === groupOf(type))!.label);
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }

  protected toggleGroup(key: MountGroup): void {
    this.group.update((g) => (g === key ? null : key));
    this.page.set(1);
  }

  protected toggleShiny(): void {
    this.onlyShiny.update((v) => !v);
    this.page.set(1);
  }

  protected select(mount: Mount | null): void {
    this.selected.set(mount);
    replaceQueryParam("mount", mount ? slugifyName(mount.name) : null);
  }
}
