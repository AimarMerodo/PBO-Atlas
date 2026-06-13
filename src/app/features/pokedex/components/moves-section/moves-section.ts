import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { Learnset, MoveInfo } from "@core/models/types";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

const CLASS_COLORS: Record<string, string> = {
  physical: "#ef4444",
  special: "#6366f1",
  status: "#9099a1",
};

type TabKey = "level" | "machine" | "egg" | "tutor";
const TABS: { key: TabKey; label: DictKey }[] = [
  { key: "level", label: "moves.level" },
  { key: "machine", label: "moves.machine" },
  { key: "egg", label: "moves.egg" },
  { key: "tutor", label: "moves.tutor" },
];

interface MoveRow {
  slug: string;
  level?: number;
  move: MoveInfo;
}

/** Learnset tables with level / TM / egg / tutor tabs and a Gen 9 disclaimer. */
@Component({
  selector: "app-moves-section",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TypeBadge],
  templateUrl: "./moves-section.html",
})
export class MovesSection {
  readonly learnset = input.required<Learnset>();
  readonly moves = input.required<Record<string, MoveInfo>>();

  protected readonly i18n = inject(LanguageService);

  private readonly selected = signal<TabKey | null>(null);

  protected readonly available = computed(() => TABS.filter(({ key }) => this.count(key) > 0));
  protected readonly tab = computed<TabKey>(() => this.selected() ?? this.available()[0]?.key ?? "level");

  protected readonly rows = computed<MoveRow[]>(() => {
    const tab = this.tab();
    const learnset = this.learnset();
    const moves = this.moves();
    const refs: { slug: string; level?: number }[] =
      tab === "level"
        ? learnset.level.map(([slug, level]) => ({ slug, level }))
        : learnset[tab].map((slug) => ({ slug }));
    return refs.flatMap((ref) => (moves[ref.slug] ? [{ ...ref, move: moves[ref.slug] }] : []));
  });

  protected count(key: TabKey): number {
    return key === "level" ? this.learnset().level.length : this.learnset()[key].length;
  }

  protected select(key: TabKey): void {
    this.selected.set(key);
  }

  protected moveName(move: MoveInfo): string {
    const lang = this.i18n.lang();
    return lang === "es" ? move.es : lang === "zh" ? move.zh || move.en : lang === "pt" ? move.pt || move.en : move.en;
  }

  protected moveDesc(move: MoveInfo): string {
    const lang = this.i18n.lang();
    return (lang === "es" ? move.descEs : lang === "zh" ? move.descZh : null) || move.descEn || "";
  }

  protected classColor(cls: string): string {
    return CLASS_COLORS[cls] ?? "#9099a1";
  }

  protected classLabel(cls: string): string {
    return this.i18n.t(("class." + cls) as DictKey);
  }
}
