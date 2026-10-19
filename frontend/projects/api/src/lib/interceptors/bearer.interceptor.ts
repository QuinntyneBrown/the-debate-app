import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../api-base-url';
import { SessionService } from '../storage/session.service';

/** Adds `Authorization: Bearer {token}` to API requests other than the token endpoint. */
export const bearerInterceptor: HttpInterceptorFn = (req, next) => {
  const base = inject(API_BASE_URL).replace(/\/$/, '');
  const token = inject(SessionService).get({ name: 'token' });
  const isApi = req.url.startsWith(base + '/');
  const isTokenEndpoint = req.url === `${base}/user/token`;
  return token && isApi && !isTokenEndpoint
    ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
    : next(req);
};
