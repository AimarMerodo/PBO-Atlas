/** Zero-pad a number to at least `len` digits (e.g. dex numbers). */
export const pad = (n: number, len = 2): string => String(n).padStart(len, "0");

/** Level range label: a single value when min===max, else `min–max` (EN DASH). */
export const levelLabel = (min: number, max: number): string =>
  min === max ? String(min) : `${min}–${max}`;
