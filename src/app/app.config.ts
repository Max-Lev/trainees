import { ApplicationConfig } from '@angular/core';
import { provideRouter, RouteReuseStrategy, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { CustomRouteReuseStrategy } from './custom-route-reuse.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    /**
     * No need: using component state approach
     */
    // { 
    //   provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy 
    // },
    provideAnimationsAsync(),
    provideAnimationsAsync(),
    provideHttpClient()
  ]
};
