import { HttpInterceptorFn } from '@angular/common/http';
import { EXPLICIT_HEADERS } from './explicit-headers';

/** Applies `Content-Type: application/json;charset=UTF-8` when the call supplied no headers. */
export const defaultHeadersInterceptor: HttpInterceptorFn = (req, next) =>
  req.context.get(EXPLICIT_HEADERS) || req.headers.has('Content-Type')
    ? next(req)
    : next(req.clone({ setHeaders: { 'Content-Type': 'application/json;charset=UTF-8' } }));
