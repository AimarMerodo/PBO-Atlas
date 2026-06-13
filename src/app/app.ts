import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Header } from "@layout/header/header";
import { FeedbackBanner } from "@layout/feedback-banner/feedback-banner";
import { SiteFooter } from "@layout/site-footer/site-footer";
import { SearchDialog } from "@shared/components/search-dialog/search-dialog";

@Component({
  selector: "app-root",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, FeedbackBanner, SiteFooter, SearchDialog],
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
    <app-search-dialog />
  `,
})
export class App {}
