import { computed, effect, inject, signal, type Signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { paginate } from "@core/utils/paginate";

/**
 * Shareable deep links for the game explorers (/items?item=..., /mounts?mount=...,
 * /cosmetics?bundle=...): rewrite the query string without triggering a navigation.
 */
function replaceQueryParam(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(null, "", url.toString());
}

/**
 * Shared "open a detail modal from a deep link, keep the URL in sync" behavior.
 * Reads the initial ?<key>=<slug> once, opens the matching entry when the list
 * loads, and rewrites the query param when the selection changes.
 *
 * Must be called from an injection context (component field initializer).
 */
export function deepLinkSelection<T>(
  source: Signal<readonly T[] | null>,
  key: string,
  slugOf: (entry: T) => string,
) {
  const initialSlug = inject(ActivatedRoute).snapshot.queryParamMap.get(key);
  const selected = signal<T | null>(null);

  effect(() => {
    const list = source();
    if (list && initialSlug) {
      selected.set(list.find((e) => slugOf(e) === initialSlug) ?? null);
    }
  });

  const select = (entry: T | null): void => {
    selected.set(entry);
    replaceQueryParam(key, entry ? slugOf(entry) : null);
  };

  return { selected, select };
}

/**
 * Shared logic for the searchable, paginated game galleries (items, mounts):
 * query + page signals, a filtered/paginated view, the deep-link modal sync,
 * and the onQuery/select handlers the templates bind to.
 *
 * Must be called from an injection context (component field initializer).
 */
export function pagedGallery<T>(opts: {
  source: Signal<readonly T[] | null>;
  filter: (entry: T, query: string) => boolean;
  pageSize: number;
  key: string;
  slugOf: (entry: T) => string;
}) {
  const { source, filter, pageSize, key, slugOf } = opts;

  const query = signal("");
  const page = signal(1);
  const { selected, select } = deepLinkSelection(source, key, slugOf);

  const filtered = computed(() => {
    const list = source() ?? [];
    const q = query().trim().toLowerCase();
    return list.filter((e) => filter(e, q));
  });

  const paged = computed(() => paginate(filtered(), page(), pageSize));
  const pageCount = computed(() => paged().pageCount);
  const current = computed(() => paged().current);
  const visible = computed(() => paged().visible);

  const onQuery = (value: string): void => {
    query.set(value);
    page.set(1);
  };

  return { query, page, selected, filtered, pageCount, current, visible, onQuery, select };
}
