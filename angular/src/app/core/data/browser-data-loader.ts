import { Injectable, TransferState, inject, makeStateKey } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { DataLoader, dataStateKey } from "./data-loader";

/** Browser adapter: hydrates from TransferState, otherwise fetches /data/<path>. */
@Injectable()
export class BrowserDataLoader implements DataLoader {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);

  load<T>(path: string): Promise<T> {
    const key = makeStateKey<T | null>(dataStateKey(path));
    if (this.transferState.hasKey(key)) {
      const value = this.transferState.get<T | null>(key, null);
      this.transferState.remove(key);
      if (value !== null) return Promise.resolve(value);
    }
    return firstValueFrom(this.http.get<T>(`/data/${path}`));
  }
}
