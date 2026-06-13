import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LucideSearch } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import { SearchDialogService } from "./search-dialog.service";

/** Header button that opens the global search dialog (rendered at app root). */
@Component({
  selector: "app-search-trigger",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSearch],
  template: `
    <button
      (click)="dialog.open()"
      class="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink-dim hover:text-ink transition-colors"
    >
      <svg lucideSearch class="h-4 w-4" aria-hidden="true"></svg>
      <span class="hidden sm:inline">{{ i18n.t("nav.search") }}</span>
      <kbd class="hidden md:inline rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-dim">Ctrl K</kbd>
    </button>
  `,
})
export class SearchTrigger {
  protected readonly i18n = inject(LanguageService);
  protected readonly dialog = inject(SearchDialogService);
}
