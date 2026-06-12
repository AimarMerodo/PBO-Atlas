import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import {
  LucideCircleHelp,
  LucideDroplet,
  LucideFish,
  LucideFootprints,
  LucideMountain,
  LucidePickaxe,
  LucideTreePine,
  LucideWaves,
} from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";

@Component({
  selector: "app-method-icon",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideCircleHelp,
    LucideDroplet,
    LucideFish,
    LucideFootprints,
    LucideMountain,
    LucidePickaxe,
    LucideTreePine,
    LucideWaves,
  ],
  template: `
    <span class="inline-flex items-center gap-1.5 whitespace-nowrap text-sm" [title]="note() ?? ''">
      @switch (method()) {
        @case ("walking") {
          <svg lucideFootprints class="h-4 w-4 text-ink-dim" aria-hidden="true"></svg>
        }
        @case ("surfing") {
          <svg lucideWaves class="h-4 w-4 text-ink-dim" aria-hidden="true"></svg>
        }
        @case ("fishing") {
          <svg lucideFish class="h-4 w-4 text-ink-dim" aria-hidden="true"></svg>
        }
        @case ("headbutt") {
          <svg lucideTreePine class="h-4 w-4 text-ink-dim" aria-hidden="true"></svg>
        }
        @case ("rock-smash") {
          <svg lucideMountain class="h-4 w-4 text-ink-dim" aria-hidden="true"></svg>
        }
        @case ("honey") {
          <svg lucideDroplet class="h-4 w-4 text-ink-dim" aria-hidden="true"></svg>
        }
        @case ("digging") {
          <svg lucidePickaxe class="h-4 w-4 text-ink-dim" aria-hidden="true"></svg>
        }
        @default {
          <svg lucideCircleHelp class="h-4 w-4 text-ink-dim" aria-hidden="true"></svg>
        }
      }
      <span class="text-ink-dim">{{ label() }}</span>
      @if (note()) {
        <span class="text-xs text-amber-400">({{ note() }})</span>
      }
    </span>
  `,
})
export class MethodIcon {
  readonly method = input.required<string>();
  readonly note = input<string | undefined>(undefined);
  private readonly i18n = inject(LanguageService);

  protected readonly label = computed(() => {
    const key = "method." + this.method();
    const value = this.i18n.t(key as DictKey);
    return value === key ? this.method() : value;
  });
}
