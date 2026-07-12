import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { SwUpdate, VersionReadyEvent } from "@angular/service-worker";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter } from "rxjs";
import { LucideRefreshCw } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";

/** True only when running as an installed PWA (standalone), not a browser tab. */
function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false;
  const standalone = ["standalone", "minimal-ui", "fullscreen", "window-controls-overlay"].some(
    (mode) => window.matchMedia?.(`(display-mode: ${mode})`).matches,
  );
  // navigator.standalone is the iOS Safari equivalent of display-mode: standalone.
  return standalone || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

/**
 * "A new version is available — Reload" toast. The Angular service worker
 * downloads a new build in the background after each deploy; this surfaces it so
 * users get the latest instead of running a cached old build until they reopen.
 * No-op when the SW is disabled (dev / unsupported browser).
 */
@Component({
  selector: "app-update-toast",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideRefreshCw],
  template: `
    @if (ready()) {
      <div
        class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-line bg-surface/95 px-4 py-2.5 text-sm shadow-xl backdrop-blur"
        role="status"
      >
        <svg lucideRefreshCw class="h-4 w-4 shrink-0 text-accent-soft" aria-hidden="true"></svg>
        <span>{{ i18n.t("update.available") }}</span>
        <button
          type="button"
          (click)="reload()"
          class="rounded-full bg-accent px-3 py-1 font-semibold text-white transition-colors hover:bg-accent-soft"
        >
          {{ i18n.t("update.reload") }}
        </button>
      </div>
    }
  `,
})
export class UpdateToast {
  protected readonly i18n = inject(LanguageService);
  private readonly sw = inject(SwUpdate);
  protected readonly ready = signal(false);

  constructor() {
    if (!this.sw.isEnabled || !isInstalledApp()) return;
    this.sw.versionUpdates
      .pipe(
        filter((e): e is VersionReadyEvent => e.type === "VERSION_READY"),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.ready.set(true));
  }

  /** Activate the already-downloaded version FIRST, then reload — otherwise the
   *  reload serves the old cached build again and the update lands one visit late. */
  protected reload(): void {
    void this.sw.activateUpdate().finally(() => document.location.reload());
  }
}
