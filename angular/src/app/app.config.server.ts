import { mergeApplicationConfig, ApplicationConfig } from "@angular/core";
import { provideServerRendering, withRoutes } from "@angular/ssr";
import { appConfig } from "./app.config";
import { serverRoutes } from "./app.routes.server";
import { DATA_LOADER } from "@core/data/data-loader";
import { ServerDataLoader } from "@core/data/server-data-loader";

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: DATA_LOADER, useClass: ServerDataLoader },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
