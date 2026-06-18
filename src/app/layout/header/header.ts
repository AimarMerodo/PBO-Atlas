import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideMenu, LucideX } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import { LanguageToggle } from "@layout/language-toggle/language-toggle";
import { SearchTrigger } from "@shared/components/search-dialog/search-trigger";

@Component({
  selector: "app-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LanguageToggle, SearchTrigger, LucideMenu, LucideX],
  templateUrl: "./header.html",
})
export class Header {
  protected readonly i18n = inject(LanguageService);

  /** Primary nav links, shared by the desktop bar and the mobile drawer. */
  protected readonly links: { route: string; label: DictKey }[] = [
    { route: "/regions", label: "nav.regions" },
    { route: "/pokedex", label: "nav.pokedex" },
    { route: "/items", label: "nav.items" },
    { route: "/mounts", label: "nav.mounts" },
    { route: "/cosmetics", label: "nav.cosmetics" },
    { route: "/feedback", label: "nav.feedback" },
  ];

  /** Mobile nav drawer open state (hamburger menu). */
  protected readonly open = signal(false);

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }
}
