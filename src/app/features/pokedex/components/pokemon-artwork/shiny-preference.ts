import { signal } from "@angular/core";

/** Shared normal/shiny artwork preference, so it persists while browsing pokemon
 *  (set it once and every pokemon you open stays shiny until you toggle it off).
 *  Module-level keeps state across navigation, same as the old root service. */
export const shinyEnabled = signal(false);
