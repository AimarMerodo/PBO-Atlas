import { ChangeDetectionStrategy, Component, computed, effect, inject, resource } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";

/** Region index: one card per region with location/species counts. */
@Component({
  selector: "app-regions-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: "./regions-page.html",
})
export class RegionsPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  private readonly home = resource({ loader: () => this.data.home() });
  protected readonly regions = computed(() => this.home.value()?.regions ?? null);

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "All Pokemon Blaze Online regions with their locations and spawns.",
    });
    effect(() => title.setTitle(`${this.i18n.t("home.regions")} | PBO Atlas`));
  }
}
