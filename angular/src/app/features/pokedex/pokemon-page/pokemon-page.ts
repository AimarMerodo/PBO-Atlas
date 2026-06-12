import { ChangeDetectionStrategy, Component, inject, input, resource } from "@angular/core";
import { DataService } from "@core/data/data.service";

@Component({
  selector: "app-pokemon-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- STUB: replaced in Fase 3 (block B) with the full detail page -->
    @if (page.value(); as p) {
      <h1 class="text-2xl font-bold">#{{ p.entry.id }} {{ p.entry.name }}</h1>
      <p class="text-sm text-ink-dim">{{ p.entry.types.join(" / ") }}</p>
      @if (p.entry.flavor) {
        <p class="mt-2 text-sm italic text-ink-dim">{{ p.entry.flavor }}</p>
      }
    }
  `,
})
export class PokemonPageComponent {
  readonly slug = input.required<string>();
  private readonly data = inject(DataService);
  protected readonly page = resource({
    params: () => this.slug(),
    loader: ({ params }) => this.data.pokemon(params),
  });
}
