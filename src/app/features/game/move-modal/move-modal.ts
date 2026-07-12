import { ChangeDetectionStrategy, Component, computed, inject, input, output, resource, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideSearch, LucideX } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { MoveDexEntry, PokedexCard } from "@core/models/types";
import { DismissOutside } from "@shared/directives/dismiss-outside";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

const CLASS_COLORS: Record<string, string> = { physical: "#ef4444", special: "#6366f1", status: "#9099a1" };

type Learner = PokedexCard & { byTm: boolean };

/** Move detail dialog: stats, description, and every pokemon that can learn it —
 *  searchable, with a marker/filter for the ones that learn it via TM. */
@Component({
  selector: "app-move-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DismissOutside, LucideSearch, LucideX, TypeBadge],
  templateUrl: "./move-modal.html",
})
export class MoveModal {
  readonly move = input.required<MoveDexEntry>();
  readonly closed = output<void>();

  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  protected readonly query = signal("");
  protected readonly onlyTm = signal(false);

  // Loaded lazily (only once a modal opens): the reverse indexes + dex for names/sprites.
  private readonly indexRes = resource({ loader: () => this.data.moveIndex() });
  private readonly tmIndexRes = resource({ loader: () => this.data.moveTmIndex() });
  private readonly dexRes = resource({ loader: () => this.data.pokedexList() });

  /** Pokemon that learn this move (dex-ordered, TM-flagged). `null` while loading. */
  private readonly learners = computed<Learner[] | null>(() => {
    const idx = this.indexRes.value();
    const tm = this.tmIndexRes.value();
    const dex = this.dexRes.value();
    if (!idx || !tm || !dex) return null;
    const slugs = new Set(idx[this.move().slug] ?? []);
    const tmSlugs = new Set(tm[this.move().slug] ?? []);
    return dex
      .filter((p) => slugs.has(p.slug))
      .sort((a, b) => a.id - b.id)
      .map((p) => ({ ...p, byTm: tmSlugs.has(p.slug) }));
  });

  /** How many of the learners can learn it via TM. */
  protected readonly tmCount = computed(() => this.learners()?.filter((p) => p.byTm).length ?? 0);

  /** Learners after the search box + "only TM" filter. */
  protected readonly shownLearners = computed<Learner[] | null>(() => {
    const list = this.learners();
    if (!list) return null;
    const q = this.query().trim().toLowerCase();
    return list.filter((p) => (!this.onlyTm() || p.byTm) && (!q || p.name.toLowerCase().includes(q)));
  });

  protected readonly moveName = computed(() => {
    const m = this.move();
    return this.i18n.pick({ en: m.en, es: m.es, zh: m.zh, pt: m.pt });
  });
  protected readonly moveDesc = computed(() => {
    const m = this.move();
    return this.i18n.pick({ en: m.descEn, es: m.descEs, zh: m.descZh }) || m.descEn || "";
  });

  protected classColor(c: string): string {
    return CLASS_COLORS[c] ?? "#9099a1";
  }
  protected classLabel(c: string): string {
    return this.i18n.t(("class." + c) as DictKey);
  }
}
