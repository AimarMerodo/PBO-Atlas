import { ChangeDetectionStrategy, Component, computed, effect, inject, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { LucideSearch } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { MoveDexEntry } from "@core/models/types";
import { Pager } from "@shared/components/pager/pager";
import { TypeBadge } from "@shared/components/type-badge/type-badge";
import { MoveModal } from "@features/game/move-modal/move-modal";
import { pagedGallery } from "@features/game/paged-gallery";

const PAGE_SIZE = 40;
const CLASS_COLORS: Record<string, string> = { physical: "#ef4444", special: "#6366f1", status: "#9099a1" };

/** Move dex: every learnable move, searchable + filterable by type/class, with a
 *  modal listing which pokemon learn it. */
@Component({
  selector: "app-moves-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSearch, Pager, TypeBadge, MoveModal],
  templateUrl: "./moves-page.html",
})
export class MovesPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  private readonly movesRes = resource({ loader: () => this.data.movesList() });
  protected readonly moves = computed(() => this.movesRes.value() ?? null);

  protected readonly type = signal<string | null>(null);
  protected readonly klass = signal<string | null>(null);

  private readonly gallery = pagedGallery<MoveDexEntry>({
    source: this.moves,
    pageSize: PAGE_SIZE,
    key: "move",
    slugOf: (m) => m.slug,
    filter: (m, q) => {
      if (q) {
        const tm = m.tm?.toLowerCase() ?? "";
        const matches = this.moveName(m).toLowerCase().includes(q) || m.en.toLowerCase().includes(q) || tm.includes(q);
        if (!matches) return false;
      }
      if (this.type() && m.type !== this.type()) return false;
      if (this.klass() && m.class !== this.klass()) return false;
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

  protected readonly types = computed(() => {
    const m = this.moves();
    return m ? [...new Set(m.map((x) => x.type))].sort() : [];
  });
  protected readonly classes = ["physical", "special", "status"];

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "Every move in Pokemon Blaze Online with type, power, and which Pokemon learn it.",
    });
    effect(() => title.setTitle(`${this.i18n.t("moves.dexTitle")} | PBO Atlas`));
  }

  protected onType(v: string): void {
    this.type.set(v || null);
    this.page.set(1);
  }
  protected onClass(v: string): void {
    this.klass.set(v || null);
    this.page.set(1);
  }

  protected moveName(m: MoveDexEntry): string {
    return this.i18n.pick({ en: m.en, es: m.es, zh: m.zh, pt: m.pt });
  }
  protected moveDesc(m: MoveDexEntry): string {
    return this.i18n.pick({ en: m.descEn, es: m.descEs, zh: m.descZh }) || m.descEn || "";
  }
  protected typeLabel(t: string): string {
    return this.i18n.t(("type." + t) as DictKey);
  }
  protected classColor(c: string): string {
    return CLASS_COLORS[c] ?? "#9099a1";
  }
  protected classLabel(c: string): string {
    return this.i18n.t(("class." + c) as DictKey);
  }
}
