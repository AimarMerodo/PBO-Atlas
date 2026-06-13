import { InjectionToken } from "@angular/core";

/** Port: loads a JSON document from /data/<path>. Adapters: browser (HTTP) and server (fs). */
export interface DataLoader {
  load<T>(path: string): Promise<T>;
}

export const DATA_LOADER = new InjectionToken<DataLoader>("DATA_LOADER");

export const dataStateKey = (path: string) => `data:${path}`;
