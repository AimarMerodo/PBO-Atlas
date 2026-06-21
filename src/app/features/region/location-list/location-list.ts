import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LanguageService } from "@core/i18n/language.service";
import type { LocationSummary } from "@core/models/types";

@Component({
  selector: "app-location-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: "./location-list.html",
})
export class LocationListComponent {
  readonly region = input.required<string>();
  readonly locations = input.required<LocationSummary[]>();

  protected readonly i18n = inject(LanguageService);
}
