import { ChangeDetectionStrategy, Component, inject, input, resource } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DataService } from "@core/data/data.service";

@Component({
  selector: "app-region-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <!-- STUB: replaced in Fase 3 (block A) with map + location list -->
    @if (page.value(); as p) {
      <h1 class="text-2xl font-bold">{{ p.meta.name }}</h1>
      <ul class="mt-4 grid gap-1 sm:grid-cols-3">
        @for (l of p.locations; track l.id) {
          <li>
            <a [routerLink]="['/region', region(), l.id]" class="text-sm text-accent-soft hover:underline">{{ l.name }}</a>
          </li>
        }
      </ul>
    }
  `,
})
export class RegionPageComponent {
  readonly region = input.required<string>();
  private readonly data = inject(DataService);
  protected readonly page = resource({
    params: () => this.region(),
    loader: ({ params }) => this.data.region(params),
  });
}
