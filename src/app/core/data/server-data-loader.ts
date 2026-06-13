import { Injectable, TransferState, inject, makeStateKey } from "@angular/core";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DataLoader, dataStateKey } from "./data-loader";

// Candidate roots for the shared /public/data folder: repo root (../public,
// while the Angular app lives in angular/) and workspace-local public/.
const DATA_ROOTS = [join(process.cwd(), "..", "public", "data"), join(process.cwd(), "public", "data")];

// Big lazy datasets are rendered server-side but NOT embedded in the HTML;
// the browser refetches them over HTTP (cheaper than megabytes of inline JSON).
const NO_TRANSFER = new Set([
  "lists/items.json",
  "lists/mounts.json",
  "lists/cosmetics.json",
  "lists/pokedex.json",
  "lists/search.json",
]);

/** Server adapter (prerender): reads from disk and seeds TransferState for hydration. */
@Injectable()
export class ServerDataLoader implements DataLoader {
  private readonly transferState = inject(TransferState);

  async load<T>(path: string): Promise<T> {
    for (const root of DATA_ROOTS) {
      try {
        const value = JSON.parse(await readFile(join(root, ...path.split("/")), "utf8")) as T;
        if (!NO_TRANSFER.has(path)) {
          this.transferState.set(makeStateKey<T>(dataStateKey(path)), value);
        }
        return value;
      } catch {
        // try next root
      }
    }
    throw new Error(`Data file not found for "${path}"`);
  }
}
