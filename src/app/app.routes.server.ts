import { RenderMode, ServerRoute } from "@angular/ssr";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { RoutesManifest } from "@core/models/types";

const MANIFEST_CANDIDATES = [
  join(process.cwd(), "..", "public", "data", "lists", "routes.json"),
  join(process.cwd(), "public", "data", "lists", "routes.json"),
];

let manifestCache: Promise<RoutesManifest> | null = null;

function manifest(): Promise<RoutesManifest> {
  manifestCache ??= (async () => {
    for (const file of MANIFEST_CANDIDATES) {
      try {
        return JSON.parse(await readFile(file, "utf8")) as RoutesManifest;
      } catch {
        // try next candidate
      }
    }
    throw new Error("routes.json manifest not found — run scripts/build-page-data.mjs");
  })();
  return manifestCache;
}

export const serverRoutes: ServerRoute[] = [
  {
    path: "pokedex/:slug",
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return (await manifest()).pokemon.map((slug) => ({ slug }));
    },
  },
  {
    path: "region/:region",
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return (await manifest()).regions.map((region) => ({ region }));
    },
  },
  {
    path: "region/:region/:location",
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return (await manifest()).locations.map((entry) => {
        const [region, location] = entry.split("/");
        return { region, location };
      });
    },
  },
  {
    path: "**",
    renderMode: RenderMode.Prerender,
  },
];
