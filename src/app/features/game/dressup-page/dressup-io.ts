/** A shareable/saveable character look (a preset minus its name). */
export interface DressupLook {
  gender: "M" | "F";
  skin: string;
  sel: Record<string, string>;
  mount: string;
}

/** URL-safe base64 of a look, for `?look=` sharing. JSON is ASCII so btoa is safe. */
export function encodeLook(look: DressupLook): string {
  return btoa(JSON.stringify(look)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeLook(param: string): Partial<DressupLook> | null {
  try {
    const o = JSON.parse(atob(param.replace(/-/g, "+").replace(/_/g, "/")));
    return o && typeof o === "object" && typeof o.sel === "object" ? o : null;
  } catch {
    return null;
  }
}

/** Trigger a browser download of `data` as pretty-printed JSON. Browser-only. */
export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
