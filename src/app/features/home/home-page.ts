import { ChangeDetectionStrategy, Component, inject, resource } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";

@Component({
  selector: "app-home-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: "./home-page.html",
})
export class HomePage {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);
  protected readonly cards = resource({ loader: () => this.data.homeCards() });
}
