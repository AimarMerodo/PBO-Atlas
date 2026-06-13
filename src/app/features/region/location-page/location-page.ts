import { ChangeDetectionStrategy, Component, computed, effect, inject, input, resource } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import { keepPrevious } from "@core/utils/keep-previous";
import { SpawnTableComponent } from "@features/region/spawn-table/spawn-table";

@Component({
  selector: "app-location-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SpawnTableComponent],
  templateUrl: "./location-page.html",
})
export class LocationPageComponent {
  readonly region = input.required<string>();
  readonly location = input.required<string>();

  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly key = computed(() => ({ region: this.region(), location: this.location() }));
  protected readonly page = resource({
    params: () => this.key(),
    loader: ({ params }) => this.data.location(params.region, params.location),
  });

  /** Keeps the previous location visible while the next one loads (no flash). */
  protected readonly view = keepPrevious(() => this.page.value());

  constructor() {
    effect(() => {
      const p = this.page.value();
      if (!p) return;
      this.title.setTitle(`${p.name} (${p.regionName}) — Spawns | PBO Atlas`);
      const species = [...new Set(p.spawns.map((s) => s.displayName))].slice(0, 10).join(", ");
      this.meta.updateTag({ name: "description", content: `Pokemon spawns in ${p.name}: ${species}` });
    });
  }
}
