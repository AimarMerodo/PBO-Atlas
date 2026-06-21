/** Shared list pagination: page count, clamped current page and the visible slice. */
export function paginate<T>(
  items: readonly T[],
  page: number,
  size: number,
): { pageCount: number; current: number; visible: T[] } {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(page, 1), pageCount);
  const visible = items.slice((current - 1) * size, current * size);
  return { pageCount, current, visible };
}
