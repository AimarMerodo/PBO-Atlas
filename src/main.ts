import { bootstrapApplication } from '@angular/platform-browser';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Real-user Core Web Vitals (RUM). main.ts is the browser entry, so this only runs client-side.
injectSpeedInsights();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
