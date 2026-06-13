import { ChangeDetectionStrategy, Component, computed, inject, resource } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideBookOpen, LucideFlaskConical, LucideMap, LucideRabbit, LucideScale, LucideShirt } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { HomePayload } from "@core/models/types";
import { CountUp } from "@shared/count-up";
import { HeroSearch } from "@features/home/hero-search/hero-search";

interface SectionCard {
  route: string;
  title: DictKey;
  desc: DictKey;
  count: (s: HomePayload["stats"]) => number;
  countLabel: DictKey;
  /** Accent colour used for the card glow / icon tint. */
  tint: string;
  /** Grid spans for the bento layout (large screens). */
  bento: string;
  /** The big card: shows artwork + description. */
  featured?: boolean;
  /** Decorative animated sprite that peeks into the card. */
  peek?: string;
}

const SPRITE = (id: string) => `https://play.pokemonshowdown.com/sprites/ani/${id}.gif`;

const SECTIONS: SectionCard[] = [
  { route: "/pokedex", title: "nav.pokedex", desc: "home.pokedexDesc", count: (s) => s.pokemon, countLabel: "home.count.pokemon", tint: "#f87171", bento: "lg:col-span-2 lg:row-span-2", featured: true, peek: SPRITE("charizard") },
  { route: "/items", title: "nav.items", desc: "home.itemsDesc", count: (s) => s.items, countLabel: "home.count.items", tint: "#a78bfa", bento: "lg:col-span-2" },
  { route: "/mounts", title: "nav.mounts", desc: "home.mountsDesc", count: (s) => s.mounts, countLabel: "home.count.mounts", tint: "#fbbf24", bento: "", peek: SPRITE("arcanine") },
  { route: "/cosmetics", title: "nav.cosmetics", desc: "home.cosmeticsDesc", count: (s) => s.cosmetics, countLabel: "home.count.bundles", tint: "#f472b6", bento: "" },
  { route: "/regions", title: "nav.regions", desc: "home.regionsDesc", count: () => 4, countLabel: "home.count.regions", tint: "#34d399", bento: "lg:col-span-2" },
  { route: "/natures", title: "nav.natures", desc: "home.naturesDesc", count: (s) => s.natures, countLabel: "home.count.natures", tint: "#2dd4bf", bento: "lg:col-span-2" },
];

@Component({
  selector: "app-home-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HeroSearch, CountUp, LucideMap, LucideBookOpen, LucideFlaskConical, LucideRabbit, LucideShirt, LucideScale],
  templateUrl: "./home-page.html",
  styleUrl: "./home-page.css",
})
export class HomePage {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  private readonly home = resource({ loader: () => this.data.home() });
  protected readonly stats = computed(() => this.home.value()?.stats ?? null);
  protected readonly regions = computed(() => this.home.value()?.regions ?? null);
  protected readonly sections = SECTIONS;

  /** Headline numbers for the animated stats band. */
  protected readonly statItems = computed(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      { value: s.pokemon, label: "home.count.pokemon" as DictKey },
      { value: s.locations, label: "home.locations" as DictKey },
      { value: s.items, label: "home.count.items" as DictKey },
      { value: s.mounts, label: "home.count.mounts" as DictKey },
      { value: s.cosmetics, label: "home.count.bundles" as DictKey },
      { value: s.natures, label: "home.count.natures" as DictKey },
    ];
  });

  // Deterministic star field for the day-cycle hero (kept in the upper sky);
  // deterministic so the prerendered HTML matches the client (no hydration drift).
  protected readonly stars = Array.from({ length: 70 }, (_, i) => ({
    left: (i * 38 + 3) % 100,
    top: (i * 53 + 7) % 55,
    size: 1 + (i % 3) * 0.6,
    tw: 2 + (i % 5),
    delay: ((i * 17) % 50) / 10,
  }));
}
