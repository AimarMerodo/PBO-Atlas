import { ChangeDetectionStrategy, Component, computed, effect, inject, resource } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { LucideBookOpen, LucideCompass, LucideFlaskConical, LucideMap, LucideMapPin, LucidePawPrint, LucideRabbit, LucideShirt, LucideSparkles, LucideTrendingUp } from "@lucide/angular";
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
  /** Stat count shown next to the title; omit for tool cards that show a `tagline` instead. */
  count?: (s: HomePayload["stats"]) => number;
  countLabel?: DictKey;
  /** Short subtitle for cards without a numeric count (e.g. the Locker tool). */
  tagline?: DictKey;
  /** Accent colour used for the card glow / icon tint. */
  tint: string;
  /** Grid spans for the bento layout (large screens). */
  bento: string;
  /** The big card: shows artwork + description. */
  featured?: boolean;
  /** Decorative animated sprite that peeks into the card corner. */
  peek?: string;
  /** Override the default peek position/size (Tailwind classes). */
  peekClass?: string;
  /** Full-card faded background image (e.g. a region map). */
  cover?: string;
}

const SPRITE = (id: string) => `https://play.pokemonshowdown.com/sprites/ani/${id}.gif`;

const SECTIONS: SectionCard[] = [
  { route: "/pokedex", title: "nav.pokedex", desc: "home.pokedexDesc", count: (s) => s.pokemon, countLabel: "home.count.pokemon", tint: "#f87171", bento: "lg:col-span-2 lg:row-span-2", featured: true, peek: SPRITE("charizard") },
  { route: "/items", title: "nav.items", desc: "home.itemsDesc", count: (s) => s.items, countLabel: "home.count.items", tint: "#a78bfa", bento: "", peek: SPRITE("delibird") },
  { route: "/mounts", title: "nav.mounts", desc: "home.mountsDesc", count: (s) => s.mounts, countLabel: "home.count.mounts", tint: "#fbbf24", bento: "", peek: "/mount-avatar.webp", peekClass: "-bottom-3 -right-3 h-32 w-32" },
  { route: "/cosmetics", title: "nav.cosmetics", desc: "home.cosmeticsDesc", count: (s) => s.cosmetics, countLabel: "home.count.bundles", tint: "#f472b6", bento: "", peek: "/tanjiro-avatar.webp", peekClass: "-bottom-3 -right-4 h-32 w-32" },
  { route: "/locker", title: "nav.dressup", desc: "home.dressupTagline", tagline: "home.dressupTagline", tint: "#38bdf8", bento: "", peek: SPRITE("mimikyu") },
];

@Component({
  selector: "app-home-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet, HeroSearch, CountUp, LucideMap, LucideBookOpen, LucideFlaskConical, LucideRabbit, LucideShirt, LucideSparkles, LucideMapPin, LucidePawPrint, LucideCompass, LucideTrendingUp],
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

  // The first region is shown as a wide cinematic hero card; the rest sit in a
  // 3-column strip below, each showing its full 5:3 map.
  protected readonly heroRegion = computed(() => this.regions()?.[0] ?? null);
  protected readonly restRegions = computed(() => this.regions()?.slice(1) ?? []);

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
    ];
  });

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.i18n.t("nav.home")} | PBO Atlas`));
  }
}
