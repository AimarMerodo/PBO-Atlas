import { ChangeDetectionStrategy, Component, computed, inject, input, output, resource, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideSearch, LucideX } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { AbilityDexEntry, PokedexCard } from "@core/models/types";
import { DismissOutside } from "@shared/directives/dismiss-outside";

type Owner = PokedexCard & { hidden: boolean };

/** Ability detail dialog: effect text + every pokemon that can have it —
 *  searchable, with a marker/filter for the ones where it's the hidden ability. */
@Component({
  selector: "app-ability-modal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DismissOutside, LucideSearch, LucideX],
  templateUrl: "./ability-modal.html",
})
export class AbilityModal {
  readonly ability = input.required<AbilityDexEntry>();
  readonly closed = output<void>();

  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  protected readonly query = signal("");
  protected readonly onlyHidden = signal(false);

  private readonly indexRes = resource({ loader: () => this.data.abilityIndex() });
  private readonly hiddenRes = resource({ loader: () => this.data.abilityHiddenIndex() });
  private readonly dexRes = resource({ loader: () => this.data.pokedexList() });

  /** Pokemon that can have this ability (dex-ordered, hidden-flagged). `null` while loading. */
  private readonly owners = computed<Owner[] | null>(() => {
    const idx = this.indexRes.value();
    const hidden = this.hiddenRes.value();
    const dex = this.dexRes.value();
    if (!idx || !hidden || !dex) return null;
    const slugs = new Set(idx[this.ability().slug] ?? []);
    const hiddenSlugs = new Set(hidden[this.ability().slug] ?? []);
    return dex
      .filter((p) => slugs.has(p.slug) && !p.notInPbo)
      .sort((a, b) => a.id - b.id)
      .map((p) => ({ ...p, hidden: hiddenSlugs.has(p.slug) }));
  });

  /** How many owners have it as their hidden ability. */
  protected readonly hiddenCount = computed(() => this.owners()?.filter((p) => p.hidden).length ?? 0);

  protected readonly shownOwners = computed<Owner[] | null>(() => {
    const list = this.owners();
    if (!list) return null;
    const q = this.query().trim().toLowerCase();
    return list.filter((p) => (!this.onlyHidden() || p.hidden) && (!q || p.name.toLowerCase().includes(q)));
  });

  protected readonly abilityName = computed(() => {
    const a = this.ability();
    return this.i18n.pick({ en: a.en, es: a.es, zh: a.zh });
  });
  protected readonly abilityText = computed(() => {
    const a = this.ability();
    return this.i18n.pick({ en: a.textEn, es: a.textEs }) || a.textEn || "";
  });
}
