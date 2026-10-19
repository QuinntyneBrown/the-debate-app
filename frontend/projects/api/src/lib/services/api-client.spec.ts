// Traces to: L2-025, L2-027
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiError } from '../models/api-error';
import { API_BASE_URL } from '../api-base-url';
import { provideApi } from '../api-config';
import { ConnectivityService } from './connectivity.service';
import { ApiClient } from './api-client';

describe('ApiClient (L2-025)', () => {
  let client: ApiClient;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideApi(), provideHttpClientTesting()] });
    client = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  it('defaults the base url to /api', () => {
    expect(TestBed.inject(API_BASE_URL)).toBe('/api');
  });

  it('L2-025/1: without headers sets the JSON content type and sends data as JSON.stringify(data)', () => {
    client.request('POST', 'meeting/add', { data: { id: 0, name: 'n' } }).subscribe();
    const req = http.expectOne('/api/meeting/add');
    expect(req.request.headers.get('Content-Type')).toBe('application/json;charset=UTF-8');
    expect(req.request.body).toBe(JSON.stringify({ id: 0, name: 'n' }));
    req.flush({});
  });

  it('L2-025/1: a request without a body still carries the default JSON content type', () => {
    client.request('GET', 'meeting/get').subscribe();
    const req = http.expectOne('/api/meeting/get');
    expect(req.request.headers.get('Content-Type')).toBe('application/json;charset=UTF-8');
    req.flush([]);
  });

  it('L2-025/2: with a headers option sends exactly those headers and the data unchanged', () => {
    client
      .request('POST', 'user/token', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: 'a=1',
      })
      .subscribe();
    const req = http.expectOne('/api/user/token');
    expect(req.request.headers.keys()).toEqual(['Content-Type']);
    expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
    expect(req.request.body).toBe('a=1');
    req.flush({});
  });

  it('L2-025/2: explicit headers without a content type do not receive the default one', () => {
    client.request('GET', 'x', { headers: { Accept: 'text/plain' } }).subscribe();
    const req = http.expectOne('/api/x');
    expect(req.request.headers.has('Content-Type')).toBe(false);
    req.flush('');
  });

  it('L2-025/3: a success response emits the response body', () => {
    let body: unknown;
    client.request('GET', 'meeting/get').subscribe((b) => (body = b));
    http.expectOne('/api/meeting/get').flush([{ id: 1 }]);
    expect(body).toEqual([{ id: 1 }]);
  });

  it('L2-025/3: responseType text emits the raw response text', () => {
    let body: unknown;
    client.request('GET', 'digitalasset/serve', { responseType: 'text' }).subscribe((b) => (body = b));
    http.expectOne('/api/digitalasset/serve').flush('raw');
    expect(body).toBe('raw');
  });

  it('L2-025/4+5: a non-success status logs the status text and settles with an ApiError carrying the status', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let error: unknown;
    client.request('GET', 'meeting/get').subscribe({ error: (e) => (error = e) });
    http.expectOne('/api/meeting/get').flush('x', { status: 500, statusText: 'Server Error' });
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).kind).toBe('server');
    expect(log).toHaveBeenCalledWith('Server Error');
  });

  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'notFound'],
    [400, 'client'],
    [503, 'server'],
  ])('L2-025/5: status %i maps to kind %s', (status, kind) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let error: ApiError | undefined;
    client.request('GET', 'x').subscribe({ error: (e) => (error = e) });
    http.expectOne('/api/x').flush('', { status, statusText: 'S' });
    expect(error?.kind).toBe(kind);
    expect(error?.status).toBe(status);
  });

  it('L2-025/5: the OAuth error_description is carried as the description', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let error: ApiError | undefined;
    client.request('POST', 'user/token').subscribe({ error: (e) => (error = e) });
    http
      .expectOne('/api/user/token')
      .flush({ error: 'invalid_grant', error_description: 'Invalid credentials' }, { status: 400, statusText: 'Bad Request' });
    expect(error?.description).toBe('Invalid credentials');
  });

  it('L2-025/5: a network failure settles with an offline ApiError and reports to ConnectivityService', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const connectivity = TestBed.inject(ConnectivityService);
    let error: ApiError | undefined;
    client.request('GET', 'x').subscribe({ error: (e) => (error = e) });
    http.expectOne('/api/x').error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    expect(error?.kind).toBe('offline');
    expect(error?.status).toBe(0);
    expect(connectivity.online()).toBe(false);
  });

  it('a later successful response marks the connection online again', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const connectivity = TestBed.inject(ConnectivityService);
    client.request('GET', 'x').subscribe({ error: () => undefined });
    http.expectOne('/api/x').error(new ProgressEvent('error'), { status: 0 });
    client.request('GET', 'y').subscribe();
    http.expectOne('/api/y').flush({});
    expect(connectivity.online()).toBe(true);
  });
});
