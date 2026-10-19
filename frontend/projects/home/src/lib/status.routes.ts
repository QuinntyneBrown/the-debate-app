import { Routes } from '@angular/router';
import { ForbiddenPageComponent } from './status-pages/forbidden-page.component';
import { NotFoundPageComponent } from './status-pages/not-found-page.component';
import { OfflinePageComponent } from './status-pages/offline-page.component';
import { ServerErrorPageComponent } from './status-pages/server-error-page.component';

/** Status pages; the wildcard entry must stay last so it only catches unmatched paths. */
export const STATUS_ROUTES: Routes = [
  { path: 'forbidden', component: ForbiddenPageComponent, title: 'Sign in to continue' },
  { path: 'server-error', component: ServerErrorPageComponent, title: 'Something went wrong' },
  { path: 'offline', component: OfflinePageComponent, title: "You're offline" },
  { path: '**', component: NotFoundPageComponent, title: 'Page not found' },
];
