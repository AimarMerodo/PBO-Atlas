import { ChangeDetectionStrategy, Component, effect, inject, input, resource, signal } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { LucideArrowLeft } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import { keepPrevious } from "@core/utils/keep-previous";
import type { DictKey } from "@core/i18n/dictionaries";
import type { GameItem, PokedexEntry } from "@core/models/types";
import { ItemIcon } from "@shared/components/item-icon/item-icon";
import { ItemModal } from "@features/game/item-modal/item-modal";
import { TypeBadge } from "@shared/components/type-badge/type-badge";
import { AbilityList } from "@features/pokedex/components/ability-list/ability-list";
import { CatchLocations } from "@features/pokedex/components/catch-locations/catch-locations";
import { EvolutionLine } from "@features/pokedex/components/evolution-line/evolution-line";
import { MovesSection } from "@features/pokedex/components/moves-section/moves-section";
import { PokemonArtwork } from "@features/pokedex/components/pokemon-artwork/pokemon-artwork";
import { StatBars } from "@features/pokedex/components/stat-bars/stat-bars";
import { TypeEffectiveness } from "@features/pokedex/components/type-effectiveness/type-effectiveness";

/** Pokemon detail page: artwork, stats, abilities, defenses, evolutions, catch spots and moves. */
@Component({
  selector: "app-pokemon-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LucideArrowLeft,
    TypeBadge,
    AbilityList,
    CatchLocations,
    EvolutionLine,
    ItemIcon,
    ItemModal,
    MovesSection,
    PokemonArtwork,
    StatBars,
    TypeEffectiveness,
  ],
  templateUrl: "./pokemon-page.html",
})
export class PokemonPageComponent {
  readonly slug = input.required<string>();

  private readonly data = inject(DataService);
  protected readonly i18n = inject(LanguageService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly page = resource({
    params: () => this.slug(),
    loader: ({ params }) => this.data.pokemon(params),
  });

  /** Keeps the previous pokemon visible while the next one loads (no flash). */
  protected readonly view = keepPrevious(() => this.page.value());

  /** The dropped item whose modal is open (in-place, no navigation). */
  protected readonly selectedDrop = signal<GameItem | null>(null);

  constructor() {
    effect(() => {
      const p = this.page.value();
      if (!p) return;
      this.title.setTitle(`${p.entry.name} | PBO Atlas`);
      const places = p.encounters.map((e) => e.locationName).slice(0, 6);
      this.meta.updateTag({
        name: "description",
        content: places.length
          ? `Where to catch ${p.entry.name} in Pokemon Blaze Online: ${places.join(", ")}`
          : `${p.entry.name} in Pokemon Blaze Online`,
      });
    });
  }

  protected tKey(key: string): string {
    return this.i18n.t(key as DictKey);
  }

  /** Localized Pokedex description (en from the game, es/zh from PokeAPI; pt falls back to en). */
  protected flavorText(entry: PokedexEntry): string {
    return this.i18n.pick({ en: entry.flavor ?? null, es: entry.flavorEs ?? null, zh: entry.flavorZh ?? null });
  }

  protected localItemName(d: GameItem): string {
    return this.i18n.pick({ en: d.name, es: d.es, zh: d.zh, pt: d.pt });
  }
}
