import { ChangeDetectionStrategy, Component, effect, inject, input, resource } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import { LocationListComponent } from "@features/region/location-list/location-list";
import { RegionMapComponent } from "@features/region/region-map/region-map";

@Component({
  selector: "app-region-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RegionMapComponent, LocationListComponent],
  templateUrl: "./region-page.html",
})
export class RegionPageComponent {
  readonly region = input.required<string>();

  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);
  private readonly title = inject(Title);

  protected readonly page = resource({
    params: () => this.region(),
    loader: ({ params }) => this.data.region(params),
  });

  constructor() {
    effect(() => {
      const p = this.page.value();
      if (p) this.title.setTitle(`${p.meta.name} — Spawns | PBO Atlas`);
    });
  }
}
