import { Routes } from '@angular/router';

/**
 * Root route table. Feature projects are lazy-loaded through their public API.
 * The meetings entry precedes the status entry, which comes last because its wildcard renders the not-found page for every unmatched path.
 */
export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('@the-debate-app/home').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('@the-debate-app/login').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('@the-debate-app/meetings').then((m) => m.MEETINGS_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('@the-debate-app/home').then((m) => m.STATUS_ROUTES),
  },
];
