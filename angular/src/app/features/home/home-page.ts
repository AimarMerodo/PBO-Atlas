import { ChangeDetectionStrategy, Component, inject, resource } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";

@Component({
  selector: "app-home-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <!-- STUB: replaced in Fase 3 (block A) with the full hero + region cards -->
    <h1 class="text-2xl font-bold">{{ i18n.t("home.heroTitle") }}</h1>
    @if (cards.value(); as cards) {
      <ul class="mt-4 space-y-1">
        @for (c of cards; track c.id) {
          <li><a [routerLink]="['/region', c.id]" class="text-accent-soft hover:underline">{{ c.name }}</a></li>
        }
      </ul>
    }
  `,
})
export class HomePage {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);
  protected readonly cards = resource({ loader: () => this.data.homeCards() });
}
