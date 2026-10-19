// Traces to: L2-027, L2-032
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { ApiClient } from '../services/api-client';
import { SessionService } from '../storage/session.service';

describe('bearerInterceptor and error interceptor (L2-027, L2-032)', () => {
  let client: ApiClient;
  let http: HttpTestingController;
  let session: SessionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideApi(), provideHttpClientTesting()] });
    client = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  it('L2-027/1: attaches Authorization: Bearer {token} when a token is stored, alongside the JSON content type', () => {
    session.put({ name: 'token', value: 'abc.def' });
    client.request('DELETE', 'meeting/remove').subscribe();
    const req = http.expectOne('/api/meeting/remove');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc.def');
    expect(req.request.headers.get('Content-Type')).toBe('application/json;charset=UTF-8');
    req.flush(1);
  });

  it('L2-027/1: sends no Authorization header when no token is stored', () => {
    client.request('GET', 'meeting/get').subscribe();
    const req = http.expectOne('/api/meeting/get');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('L2-027/2: never attaches the token to the token endpoint', () => {
    session.put({ name: 'token', value: 'stale' });
    client
      .request('POST', 'user/token', { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: '' })
      .subscribe();
    const req = http.expectOne('/api/user/token');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('L2-027/1: never attaches the token to requests outside the API base url', () => {
    session.put({ name: 'token', value: 'abc' });
    TestBed.inject(HttpClient).get('https://elsewhere.example/x').subscribe();
    const req = http.expectOne('https://elsewhere.example/x');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('L2-032/2 + L2-025/5: a 401 clears the stored token, signals expiry and still settles with an ApiError', () => {
    session.put({ name: 'token', value: 'abc' });
    let expired = 0;
    session.expired$.subscribe(() => expired++);
    let kind: string | undefined;
    client.request('GET', 'x').subscribe({ error: (e) => (kind = e.kind) });
    http.expectOne('/api/x').flush('', { status: 401, statusText: 'Unauthorized' });
    expect(session.get({ name: 'token' })).toBeNull();
    expect(expired).toBe(1);
    expect(kind).toBe('unauthorized');
  });

  it('L2-032/2: a 401 without a stored token does not signal expiry', () => {
    let expired = 0;
    session.expired$.subscribe(() => expired++);
    client.request('GET', 'x').subscribe({ error: () => undefined });
    http.expectOne('/api/x').flush('', { status: 401, statusText: 'Unauthorized' });
    expect(expired).toBe(0);
  });
});
