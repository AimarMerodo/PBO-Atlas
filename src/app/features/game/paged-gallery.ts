import { computed, inject, signal, type Signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
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
 * The selection follows the ?<key>=<slug> query param reactively, so it opens
 * both from the initial URL AND from later navigations (e.g. the global search
 * landing on this page while it's already mounted). Internal clicks use
 * replaceState to update the URL without a scroll-to-top navigation.
 *
 * Must be called from an injection context (component field initializer).
 */
export function deepLinkSelection<T>(
  source: Signal<readonly T[] | null>,
  key: string,
  slugOf: (entry: T) => string,
) {
  const route = inject(ActivatedRoute);
  const param = signal<string | null>(route.snapshot.queryParamMap.get(key));
  // React to external navigations that change ?<key>= (e.g. the global search).
  // Internal selects use replaceState, which the router doesn't emit, so they
  // update `param` directly below — no double-fire, no navigation/scroll.
  route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((m) => param.set(m.get(key)));

  const selected = computed<T | null>(() => {
    const list = source();
    const slug = param();
    if (!list || !slug) return null;
    return list.find((e) => slugOf(e) === slug) ?? null;
  });

  const select = (entry: T | null): void => {
    const slug = entry ? slugOf(entry) : null;
    param.set(slug);
    replaceQueryParam(key, slug);
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
