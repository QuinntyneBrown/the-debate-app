import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { API_BASE_URL } from './api-base-url';
import { apiErrorInterceptor } from './interceptors/api-error.interceptor';
import { bearerInterceptor } from './interceptors/bearer.interceptor';
import { defaultHeadersInterceptor } from './interceptors/default-headers.interceptor';

/** Registers HttpClient with the default-header, bearer and error interceptors. */
export function provideApi(config: { baseUrl?: string } = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(config.baseUrl === undefined ? [] : [{ provide: API_BASE_URL, useValue: config.baseUrl }]),
    provideHttpClient(withInterceptors([defaultHeadersInterceptor, bearerInterceptor, apiErrorInterceptor])),
  ]);
}
