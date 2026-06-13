import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LanguageService } from "@core/i18n/language.service";
import { LanguageToggle } from "@layout/language-toggle/language-toggle";
import { NavMore } from "@layout/nav-more/nav-more";
import { SearchTrigger } from "@shared/components/search-dialog/search-trigger";

@Component({
  selector: "app-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LanguageToggle, NavMore, SearchTrigger],
  templateUrl: "./header.html",
})
export class Header {
  protected readonly i18n = inject(LanguageService);
}
