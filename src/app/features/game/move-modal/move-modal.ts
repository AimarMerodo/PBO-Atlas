import { ChangeDetectionStrategy, Component, computed, inject, input, output, resource } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideX } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { MoveDexEntry } from "@core/models/types";
import { DismissOutside } from "@shared/directives/dismiss-outside";
import { TypeBadge } from "@shared/components/type-badge/type-badge";

const CLASS_COLORS: Record<string, string> = { physical: "#ef4444", special: "#6366f1", status: "#9099a1" };

/** Move detail dialog: stats, description, and every pokemon that can learn it. */
@Component({
  selector: "app-move-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DismissOutside, LucideX, TypeBadge],
  templateUrl: "./move-modal.html",
})
export class MoveModal {
  readonly move = input.required<MoveDexEntry>();
  readonly closed = output<void>();

  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  // Loaded lazily (only once a modal opens): the reverse index + dex for names/sprites.
  private readonly indexRes = resource({ loader: () => this.data.moveIndex() });
  private readonly dexRes = resource({ loader: () => this.data.pokedexList() });

  /** Pokemon that learn this move, ordered by dex number. `null` while loading. */
  protected readonly learners = computed(() => {
    const idx = this.indexRes.value();
    const dex = this.dexRes.value();
    if (!idx || !dex) return null;
    const slugs = new Set(idx[this.move().slug] ?? []);
    return dex.filter((p) => slugs.has(p.slug)).sort((a, b) => a.id - b.id);
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
