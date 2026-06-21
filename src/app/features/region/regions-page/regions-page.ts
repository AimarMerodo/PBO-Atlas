import { ChangeDetectionStrategy, Component, computed, effect, inject, resource } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { LucideArrowRight, LucideMap, LucideMapPin, LucidePawPrint } from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import { pad } from "@core/utils/format";

/** Region index: one large map "poster" per region, with aggregate totals. */
@Component({
  selector: "app-regions-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideMap, LucideMapPin, LucidePawPrint, LucideArrowRight],
  templateUrl: "./regions-page.html",
})
export class RegionsPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);

  private readonly home = resource({ loader: () => this.data.home() });
  protected readonly regions = computed(() => this.home.value()?.regions ?? null);
  protected readonly skeleton = [0, 1, 2, 3];

  /** Aggregate counts shown in the page header. */
  protected readonly totals = computed(() => {
    const r = this.regions();
    if (!r) return null;
    return {
      regions: r.length,
      locations: r.reduce((sum, x) => sum + x.locations, 0),
      species: r.reduce((sum, x) => sum + x.species, 0),
    };
  });

  protected readonly pad = pad;

  constructor() {
    const title = inject(Title);
    inject(Meta).updateTag({
      name: "description",
      content: "All Pokemon Blaze Online regions with their locations and spawns.",
    });
    effect(() => title.setTitle(`${this.i18n.t("home.regions")} | PBO Atlas`));
  }
}
