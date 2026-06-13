import { Injectable, signal } from "@angular/core";

/**
 * Search dialog open/close state. The trigger button lives in the header,
 * but the overlay must render at the app root: the header's backdrop-filter
 * creates a containing block that would trap a position:fixed overlay.
 */
@Injectable({ providedIn: "root" })
export class SearchDialogService {
  private readonly _open = signal(false);
  readonly isOpen = this._open.asReadonly();

  open(): void {
    this._open.set(true);
  }

  close(): void {
    this._open.set(false);
  }
}
