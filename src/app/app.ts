import { ApplicationRef, ChangeDetectionStrategy, Component, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { Header } from "@layout/header/header";
import { FeedbackBanner } from "@layout/feedback-banner/feedback-banner";
import { SiteFooter } from "@layout/site-footer/site-footer";
import { ScrollTop } from "@layout/scroll-top/scroll-top";
import { UpdateToast } from "@layout/update-toast/update-toast";
import { SearchDialog } from "@shared/components/search-dialog/search-dialog";

@Component({
  selector: "app-root",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, FeedbackBanner, SiteFooter, ScrollTop, UpdateToast, SearchDialog],
  template: `
    <div class="min-h-screen flex flex-col antialiased">
      <app-header />
      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <router-outlet />
      </main>
      <app-feedback-banner />
      <app-site-footer />
    </div>
    <!-- Overlays live outside the header to escape its backdrop-filter containing block -->
    <app-scroll-top />
    <app-update-toast />
    <app-search-dialog />
  `,
})
export class App {
  constructor() {
    // Reveal the app once hydration applied the saved language (see index.html);
    // the timeout is a failsafe so the page never stays hidden.
    const appRef = inject(ApplicationRef);
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      Promise.race([appRef.whenStable(), new Promise((resolve) => setTimeout(resolve, 2500))]).then(() =>
        document.documentElement.classList.remove("lang-pending"),
      );
    }
  }
}
