import { InjectionToken } from '@angular/core';

/** Base url of the REST API; `/api` unless a shell provides another value. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
