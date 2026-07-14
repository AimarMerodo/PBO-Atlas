import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("@features/home/home-page").then((m) => m.HomePage),
  },
  {
    path: "regions",
    loadComponent: () => import("@features/region/regions-page/regions-page").then((m) => m.RegionsPageComponent),
  },
  {
    path: "region/:region",
    loadComponent: () => import("@features/region/region-page/region-page").then((m) => m.RegionPageComponent),
  },
  {
    path: "region/:region/:location",
    loadComponent: () =>
      import("@features/region/location-page/location-page").then((m) => m.LocationPageComponent),
  },
  {
    path: "pokedex",
    loadComponent: () => import("@features/pokedex/pokedex-page/pokedex-page").then((m) => m.PokedexPageComponent),
  },
  {
    path: "pokedex/:slug",
    loadComponent: () => import("@features/pokedex/pokemon-page/pokemon-page").then((m) => m.PokemonPageComponent),
  },
  {
    path: "shiny",
    loadComponent: () => import("@features/shiny/shiny-page/shiny-page").then((m) => m.ShinyPageComponent),
  },
  {
    path: "shiny/favorites",
    loadComponent: () => import("@features/shiny/shiny-page/shiny-page").then((m) => m.ShinyPageComponent),
    data: { favs: true },
  },
  {
    path: "items",
    loadComponent: () => import("@features/game/items-page/items-page").then((m) => m.ItemsPageComponent),
  },
  {
    path: "moves",
    loadComponent: () => import("@features/game/moves-page/moves-page").then((m) => m.MovesPageComponent),
  },
  {
    path: "abilities",
    loadComponent: () => import("@features/game/abilities-page/abilities-page").then((m) => m.AbilitiesPageComponent),
  },
  {
    path: "type-calculator",
    loadComponent: () => import("@features/tools/type-calculator/type-calculator").then((m) => m.TypeCalculatorComponent),
  },
  {
    path: "mounts",
    loadComponent: () => import("@features/game/mounts-page/mounts-page").then((m) => m.MountsPageComponent),
  },
  {
    path: "cosmetics",
    loadComponent: () =>
      import("@features/game/cosmetics-page/cosmetics-page").then((m) => m.CosmeticsPageComponent),
  },
  {
    path: "locker",
    loadComponent: () => import("@features/game/dressup-page/dressup-page").then((m) => m.DressupPageComponent),
  },
  {
    path: "feedback",
    loadComponent: () => import("@features/feedback/feedback-page").then((m) => m.FeedbackPage),
  },
  { path: "**", redirectTo: "" },
];
