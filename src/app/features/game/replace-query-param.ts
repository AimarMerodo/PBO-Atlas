/**
 * Shareable deep links for the game explorers (/items?item=..., /mounts?mount=...,
 * /cosmetics?bundle=...): rewrite the query string without triggering a navigation.
 */
export function replaceQueryParam(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(null, "", url.toString());
}
