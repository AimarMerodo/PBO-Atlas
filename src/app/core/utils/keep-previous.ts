import { Signal, linkedSignal } from "@angular/core";

/**
 * Holds the last non-nullish value while a resource reloads, so a param-driven
 * page keeps showing the previous content instead of blanking out (flashing)
 * between navigations. Pair with `resource.isLoading()` for a subtle loading cue.
 */
export function keepPrevious<T>(source: () => T | undefined): Signal<T | undefined> {
  return linkedSignal<T | undefined, T | undefined>({
    source,
    computation: (value, previous) => value ?? previous?.value,
  });
}
