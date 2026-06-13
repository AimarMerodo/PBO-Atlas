import { ChangeDetectionStrategy, Component, computed, inject, resource } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideBookOpen, LucideFlaskConical, LucideMap, LucideRabbit, LucideScale, LucideSearch, LucideShirt } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { HomePayload } from "@core/models/types";
import { SearchDialogService } from "@shared/components/search-dialog/search-dialog.service";

interface SectionCard {
  route: string;
  title: DictKey;
  desc: DictKey;
  count: (s: HomePayload["stats"]) => number;
  countLabel: DictKey;
  /** Accent colour used for the card glow / icon tint. */
  tint: string;
}

const SECTIONS: SectionCard[] = [
  { route: "/regions", title: "nav.regions", desc: "home.regionsDesc", count: () => 4, countLabel: "home.count.regions", tint: "#34d399" },
  { route: "/pokedex", title: "nav.pokedex", desc: "home.pokedexDesc", count: (s) => s.pokemon, countLabel: "home.count.pokemon", tint: "#f87171" },
  { route: "/items", title: "nav.items", desc: "home.itemsDesc", count: (s) => s.items, countLabel: "home.count.items", tint: "#a78bfa" },
  { route: "/mounts", title: "nav.mounts", desc: "home.mountsDesc", count: (s) => s.mounts, countLabel: "home.count.mounts", tint: "#fbbf24" },
  { route: "/cosmetics", title: "nav.cosmetics", desc: "home.cosmeticsDesc", count: (s) => s.cosmetics, countLabel: "home.count.bundles", tint: "#f472b6" },
  { route: "/natures", title: "nav.natures", desc: "home.naturesDesc", count: (s) => s.natures, countLabel: "home.count.natures", tint: "#2dd4bf" },
];

@Component({
  selector: "app-home-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideSearch, LucideMap, LucideBookOpen, LucideFlaskConical, LucideRabbit, LucideShirt, LucideScale],
  templateUrl: "./home-page.html",
})
export class HomePage {
  protected readonly i18n = inject(LanguageService);
  protected readonly search = inject(SearchDialogService);
  private readonly data = inject(DataService);

  private readonly home = resource({ loader: () => this.data.home() });
  protected readonly stats = computed(() => this.home.value()?.stats ?? null);
  protected readonly sections = SECTIONS;
}
