import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { LucideX } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { NamedOption } from "@core/models/types";

/** Searchable single-select: type to filter a long option list (abilities, moves…).
 *  Emits the picked option's slug, or null when cleared. */
@Component({
  selector: "app-combobox",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideX],
  template: `
    <div class="relative">
      <input
        [value]="query()"
        (input)="onInput($any($event.target).value)"
        (focus)="open.set(true)"
        (blur)="close()"
        [placeholder]="placeholder()"
        class="w-44 rounded-lg border border-line bg-surface py-1.5 pl-2.5 pr-7 text-sm text-ink outline-none transition-colors hover:border-accent/40 focus:border-accent/70"
      />
      @if (value()) {
        <button
          type="button"
          (mousedown)="clear(); $event.preventDefault()"
          [title]="i18n.t('common.clear')"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink"
        >
          <svg lucideX class="h-3.5 w-3.5" aria-hidden="true"></svg>
        </button>
      }
      @if (open() && filtered().length) {
        <ul class="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-line bg-surface py-1 shadow-xl">
          @for (o of filtered(); track o.slug) {
            <li>
              <button
                type="button"
                (mousedown)="pick(o); $event.preventDefault()"
                class="block w-full px-3 py-1.5 text-left text-sm hover:bg-surface-2"
                [class.text-accent-soft]="o.slug === value()"
              >
                {{ label(o) }}
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class Combobox {
  readonly options = input.required<NamedOption[]>();
  readonly value = input<string | null>(null);
  readonly placeholder = input("");
  readonly valueChange = output<string | null>();

  protected readonly i18n = inject(LanguageService);
  protected readonly open = signal(false);
  protected readonly query = signal("");

  protected label(o: NamedOption): string {
    return this.i18n.pick({ en: o.en, es: o.es, zh: o.zh, pt: o.pt });
  }

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const opts = this.options();
    const matches = q ? opts.filter((o) => this.label(o).toLowerCase().includes(q)) : opts;
    return matches.slice(0, 50);
  });

  constructor() {
    // Reflect external clears (e.g. "Clear filters") back into the input.
    effect(() => {
      if (this.value() === null) this.query.set("");
    });
  }

  protected onInput(v: string): void {
    this.query.set(v);
    this.open.set(true);
  }
  protected pick(o: NamedOption): void {
    this.query.set(this.label(o));
    this.open.set(false);
    this.valueChange.emit(o.slug);
  }
  protected clear(): void {
    this.query.set("");
    this.open.set(false);
    this.valueChange.emit(null);
  }
  // Delay so a click on an option (mousedown) registers before the list closes.
  protected close(): void {
    setTimeout(() => this.open.set(false), 150);
  }
}
