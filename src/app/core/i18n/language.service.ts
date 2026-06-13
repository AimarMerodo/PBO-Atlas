import { Injectable, PLATFORM_ID, inject, signal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { dictionaries, type DictKey, type Lang } from "./dictionaries";

const STORAGE_KEY = "pbo-lang";
const VALID_LANGS: Lang[] = ["en", "es", "zh", "pt"];

@Injectable({ providedIn: "root" })
export class LanguageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _lang = signal<Lang>("en");

  readonly lang = this._lang.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_LANGS.includes(stored as Lang)) this._lang.set(stored as Lang);
    }
  }

  setLang(lang: Lang): void {
    this._lang.set(lang);
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(STORAGE_KEY, lang);
  }

  /** Translate a UI key; reads the lang signal so templates react to changes. */
  t(key: DictKey): string {
    return dictionaries[this._lang()][key] ?? key;
  }

  /** Pick a localized value from a per-language record (en fallback). */
  pick(record: Partial<Record<string, string | null>>): string {
    return record[this._lang()] ?? record["en"] ?? "";
  }
}
