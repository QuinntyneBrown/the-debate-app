import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url';
import { EXPLICIT_HEADERS } from '../interceptors/explicit-headers';

export interface RequestOptions {
  /** When present, exactly these headers are sent and `data` is sent unchanged. */
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string | number>;
  responseType?: 'json' | 'text';
}

/** Wraps HttpClient: one Observable per call, always settling (success or ApiError). */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/$/, '');

  request<T>(method: string, url: string, options: RequestOptions = {}): Observable<T> {
    const explicit = options.headers !== undefined;
    const body = explicit ? options.data : options.data === undefined ? null : JSON.stringify(options.data);
    return this.http.request(method, `${this.baseUrl}/${url}`, {
      body,
      headers: options.headers,
      params: options.params,
      responseType: (options.responseType ?? 'json') as 'json',
      context: new HttpContext().set(EXPLICIT_HEADERS, explicit),
    }) as Observable<T>;
  }
}
