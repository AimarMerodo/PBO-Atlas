import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { LucideChevronDown, LucideMenu, LucideX } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import { LanguageToggle } from "@layout/language-toggle/language-toggle";
import { SearchTrigger } from "@shared/components/search-dialog/search-trigger";

interface NavLink {
  route: string;
  label: DictKey;
  exact?: boolean;
}
/** A hover/focus dropdown grouping several links under one label. */
interface NavGroup {
  label: DictKey;
  children: NavLink[];
}
type NavItem = NavLink | NavGroup;

@Component({
  selector: "app-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  // display:contents removes the host's own box so the inner `position: sticky`
  // <header> is a direct child of the full-height app shell — otherwise it can
  // only stick within the host's ~header-height box and scrolls away immediately.
  host: { class: "contents" },
  imports: [RouterLink, RouterLinkActive, LanguageToggle, SearchTrigger, LucideChevronDown, LucideMenu, LucideX],
  templateUrl: "./header.html",
})
export class Header {
  protected readonly i18n = inject(LanguageService);

  /** Primary nav, shared by the desktop bar and the mobile drawer. Item/Mounts/
   *  Cosmetics live under an "Items" dropdown to keep the top bar short.
   *  `exact` on Home so its underline only lights up on "/" (not every route). */
  protected readonly nav: NavItem[] = [
    { route: "/", label: "nav.home", exact: true },
    { route: "/regions", label: "nav.regions" },
    { route: "/pokedex", label: "nav.pokedex" },
    { route: "/shiny", label: "nav.shiny" },
    {
      label: "nav.catalog",
      children: [
        { route: "/items", label: "nav.items" },
        { route: "/moves", label: "nav.moves" },
        { route: "/mounts", label: "nav.mounts" },
        { route: "/cosmetics", label: "nav.cosmetics" },
      ],
    },
    { route: "/locker", label: "nav.dressup" },
    { route: "/feedback", label: "nav.feedback" },
  ];

  protected isGroup(item: NavItem): item is NavGroup {
    return "children" in item;
  }

  /** Mobile nav drawer open state (hamburger menu). */
  protected readonly open = signal(false);

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }
}
