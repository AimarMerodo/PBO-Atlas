import { Injectable, inject } from "@angular/core";
import { DATA_LOADER } from "./data-loader";
import type {
  CosmeticBundle,
  GameItem,
  HomeRegionCard,
  LocationPage,
  Mount,
  Nature,
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

  homeCards = () => this.getJson<HomeRegionCard[]>("lists/home.json");
  region = (id: string) => this.getJson<RegionPage>(`regions/${id}.json`);
  location = (region: string, id: string) => this.getJson<LocationPage>(`locations/${region}/${id}.json`);
  pokemon = (slug: string) => this.getJson<PokemonPage>(`pokemon/${slug}.json`);
  pokedexList = () => this.getJson<PokedexCard[]>("lists/pokedex.json");
  searchIndex = () => this.getJson<SearchIndex>("lists/search.json");
  natures = () => this.getJson<Nature[]>("lists/natures.json");
  items = () => this.getJson<{ items: GameItem[] }>("lists/items.json");
  mounts = () => this.getJson<Mount[]>("lists/mounts.json");
  cosmetics = () => this.getJson<CosmeticBundle[]>("lists/cosmetics.json");
}
