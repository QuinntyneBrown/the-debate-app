// Traces to: L2-027, L2-032, L2-013
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiError } from '../models/api-error';
import { provideApi } from '../api-config';
import { SessionService } from '../storage/session.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let session: SessionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideApi(), provideHttpClientTesting()] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  it('L2-027/2: tryToLogin posts the URL-encoded form with spaces as + and grant_type=password', () => {
    auth.tryToLogin({ username: 'a b', password: 'p&w d' }).subscribe();
    const req = http.expectOne('/api/user/token');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
    expect(req.request.body).toBe('username=a+b&password=p%26w+d&grant_type=password');
    req.flush({ access_token: 't', token_type: 'bearer', expires_in: 7200 });
  });

  it('L2-032/3: a successful sign in stores the access token under the name token', () => {
    expect(auth.signedIn()).toBe(false);
    let token: string | undefined;
    auth.tryToLogin({ username: 'admin', password: 'x' }).subscribe((r) => (token = r.access_token));
    http.expectOne('/api/user/token').flush({ access_token: 'jwt', token_type: 'bearer', expires_in: 7200 });
    expect(token).toBe('jwt');
    expect(session.get({ name: 'token' })).toBe('jwt');
    expect(auth.signedIn()).toBe(true);
  });

  it('L2-032/4 + L2-013/2: invalid credentials fail with an ApiError and store nothing', () => {
    let error: ApiError | undefined;
    auth.tryToLogin({ username: 'admin', password: 'bad' }).subscribe({ error: (e) => (error = e) });
    http
      .expectOne('/api/user/token')
      .flush({ error: 'invalid_grant', error_description: 'Invalid credentials' }, { status: 400, statusText: 'Bad Request' });
    expect(error?.description).toBe('Invalid credentials');
    expect(session.get({ name: 'token' })).toBeNull();
    expect(auth.signedIn()).toBe(false);
  });

  it('L2-027/3: getCurrentUser sends GET api/user/current with the default JSON headers', () => {
    auth.getCurrentUser().subscribe();
    const req = http.expectOne('/api/user/current');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Content-Type')).toBe('application/json;charset=UTF-8');
    req.flush({ id: 1, name: 'Jordan Reyes' });
  });

  it('L2-027/3: getCurrentUser maps an empty body to null and exposes the user', () => {
    let user: unknown = 'unset';
    auth.getCurrentUser().subscribe((u) => (user = u));
    http.expectOne('/api/user/current').flush(null);
    expect(user).toBeNull();
    expect(auth.user()).toBeNull();
  });

  it('getCurrentUser exposes the loaded user as a signal', () => {
    auth.getCurrentUser().subscribe();
    http.expectOne('/api/user/current').flush({ id: 1, name: 'Jordan Reyes' });
    expect(auth.user()).toEqual({ id: 1, name: 'Jordan Reyes' });
  });

  it('L2-032/1: signOut removes the stored token and the current user', () => {
    session.put({ name: 'token', value: 'jwt' });
    auth.getCurrentUser().subscribe();
    http.expectOne('/api/user/current').flush({ id: 1, name: 'Jordan Reyes' });
    auth.signOut();
    expect(session.get({ name: 'token' })).toBeNull();
    expect(auth.signedIn()).toBe(false);
    expect(auth.user()).toBeNull();
  });

  it('L2-032/2: signedIn starts true when a token is stored and turns false when the session expires', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('theDebateApp', JSON.stringify([{ name: 'token', value: 'jwt' }]));
    TestBed.configureTestingModule({ providers: [provideApi(), provideHttpClientTesting()] });
    const fresh = TestBed.inject(AuthService);
    expect(fresh.signedIn()).toBe(true);
    let expired = 0;
    fresh.sessionExpired$.subscribe(() => expired++);
    TestBed.inject(SessionService).expire();
    expect(expired).toBe(1);
    expect(fresh.signedIn()).toBe(false);
  });
});
