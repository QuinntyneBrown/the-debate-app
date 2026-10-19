/** Classification of a failed API call; see the http-client design. */
export type ApiErrorKind = 'unauthorized' | 'forbidden' | 'notFound' | 'server' | 'offline' | 'client';

/** Typed error emitted by every API call whose response is not a success or never arrives. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly kind: ApiErrorKind,
    /** The OAuth `error_description` when the response carries one. */
    readonly description: string | null = null,
    statusText = '',
  ) {
    super(description ?? (statusText || `Request failed with status ${status}`));
    this.name = 'ApiError';
  }

  static fromStatus(status: number, statusText: string, body: unknown): ApiError {
    const raw = body !== null && typeof body === 'object' ? (body as Record<string, unknown>)['error_description'] : null;
    const description = typeof raw === 'string' ? raw : null;
    return new ApiError(status, ApiError.kindOf(status), description, statusText);
  }

  private static kindOf(status: number): ApiErrorKind {
    if (status === 0) return 'offline';
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    if (status === 404) return 'notFound';
    if (status >= 500) return 'server';
    return 'client';
  }
}
