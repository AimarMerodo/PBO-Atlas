import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { LucideMoon, LucideSun, LucideSunMoon } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { SpawnTime } from "@core/models/types";

@Component({
  selector: "app-time-icon",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideMoon, LucideSun, LucideSunMoon],
  template: `
    <span [title]="label()" [attr.aria-label]="label()" class="inline-flex items-center text-ink-dim">
      @switch (time()) {
        @case ("day") {
          <svg lucideSun class="h-4 w-4 text-amber-400"></svg>
        }
        @case ("night") {
          <svg lucideMoon class="h-4 w-4 text-indigo-300"></svg>
        }
        @default {
          <svg lucideSunMoon class="h-4 w-4"></svg>
        }
      }
    </span>
  `,
})
export class TimeIcon {
  readonly time = input.required<SpawnTime>();
  private readonly i18n = inject(LanguageService);
  protected readonly label = computed(() => this.i18n.t(("time." + this.time()) as DictKey));
}
