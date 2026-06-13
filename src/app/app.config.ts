import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from "@angular/router";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";

import { routes } from "./app.routes";
import { DATA_LOADER } from "@core/data/data-loader";
import { BrowserDataLoader } from "@core/data/browser-data-loader";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: "top" })
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    { provide: DATA_LOADER, useClass: BrowserDataLoader },
  ],
};
