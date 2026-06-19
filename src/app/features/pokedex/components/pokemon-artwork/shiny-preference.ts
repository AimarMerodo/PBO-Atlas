import { Injectable, signal } from "@angular/core";

/** Shared normal/shiny artwork preference, so it persists while browsing pokemon
 *  (set it once and every pokemon you open stays shiny until you toggle it off). */
@Injectable({ providedIn: "root" })
export class ShinyPreference {
  readonly shiny = signal(false);

  toggle(): void {
    this.shiny.update((s) => !s);
  }
}
