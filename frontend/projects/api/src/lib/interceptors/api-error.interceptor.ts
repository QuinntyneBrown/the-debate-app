import { HttpErrorResponse, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { ApiError } from '../models/api-error';
import { ConnectivityService } from '../services/connectivity.service';
import { SessionService } from '../storage/session.service';

/**
 * Settles every failed call with an ApiError. A 401 on a request that carried a
 * token removes the token and signals that the session expired.
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const connectivity = inject(ConnectivityService);
  const hadToken = session.get({ name: 'token' }) !== null;
  return next(req).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) connectivity.reportOnline();
    }),
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);
      console.error(error.statusText);
      const apiError = ApiError.fromStatus(error.status, error.statusText, error.error);
      if (apiError.kind === 'offline') connectivity.reportOffline();
      if (apiError.kind === 'unauthorized' && hadToken) session.expire();
      return throwError(() => apiError);
    }),
  );
};
