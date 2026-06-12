import { ChangeDetectionStrategy, Component, computed, inject, input, resource } from "@angular/core";
import { DataService } from "@core/data/data.service";

@Component({
  selector: "app-location-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- STUB: replaced in Fase 3 (block A) with the spawn table + filters -->
    @if (page.value(); as p) {
      <h1 class="text-2xl font-bold">{{ p.name }}</h1>
      <p class="text-sm text-ink-dim">{{ p.spawns.length }} spawns</p>
    }
  `,
})
export class LocationPageComponent {
  readonly region = input.required<string>();
  readonly location = input.required<string>();
  private readonly data = inject(DataService);
  protected readonly key = computed(() => ({ region: this.region(), location: this.location() }));
  protected readonly page = resource({
    params: () => this.key(),
    loader: ({ params }) => this.data.location(params.region, params.location),
  });
}
