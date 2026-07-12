import { Injectable, inject } from "@angular/core";
import { DATA_LOADER } from "./data-loader";
import type {
  CosmeticBundle,
  DressupData,
  FilterOptions,
  GameItem,
  HomePayload,
  LocationPage,
  Mount,
  MoveDexEntry,
  PokedexCard,
  PokemonPage,
  RegionPage,
  SearchIndex,
} from "@core/models/types";

/** Facade over the data loader with in-memory caching. */
@Injectable({ providedIn: "root" })
export class DataService {
  private readonly loader = inject(DATA_LOADER);
  private readonly cache = new Map<string, Promise<unknown>>();

  private getJson<T>(path: string): Promise<T> {
    if (!this.cache.has(path)) this.cache.set(path, this.loader.load<T>(path));
    return this.cache.get(path) as Promise<T>;
  }

  home = () => this.getJson<HomePayload>("lists/home.json");
  region = (id: string) => this.getJson<RegionPage>(`regions/${id}.json`);
  location = (region: string, id: string) => this.getJson<LocationPage>(`locations/${region}/${id}.json`);
  pokemon = (slug: string) => this.getJson<PokemonPage>(`pokemon/${slug}.json`);
  pokedexList = () => this.getJson<PokedexCard[]>("lists/pokedex.json");
  searchIndex = () => this.getJson<SearchIndex>("lists/search.json");
  items = () => this.getJson<{ items: GameItem[] }>("lists/items.json");
  /** Descriptions + sources per item slug; loaded only when an item modal opens. */
  itemDetails = () => this.getJson<Record<string, Partial<GameItem>>>("lists/item-details.json");
  mounts = () => this.getJson<Mount[]>("lists/mounts.json");
  cosmetics = () => this.getJson<CosmeticBundle[]>("lists/cosmetics.json");
  dressup = () => this.getJson<DressupData>("dressup.json");
  filters = () => this.getJson<FilterOptions>("lists/filters.json");
  /** Full move dex: every learnable move with stats + learn count. */
  movesList = () => this.getJson<MoveDexEntry[]>("lists/moves.json");
  /** move slug -> pokemon slugs that learn it. Big; loaded only when the move filter/modal is used. */
  moveIndex = () => this.getJson<Record<string, string[]>>("lists/move-index.json");
}
