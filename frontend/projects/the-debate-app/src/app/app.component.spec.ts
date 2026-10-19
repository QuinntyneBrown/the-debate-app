// Traces to: L2-019, L2-031, L2-032, L2-033, L2-025
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { ApiClient, ConnectivityService, SessionService, provideApi } from '@the-debate-app/api';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';

describe('AppComponent shell', () => {
  let fixture: ComponentFixture<AppComponent>;
  let el: HTMLElement;
  let router: Router;
  let http: HttpTestingController;

  /** Boots the shell. `signedIn` seeds a stored token, as an earlier page load would have. */
  async function start(url: string, options: { signedIn?: boolean } = {}): Promise<void> {
    localStorage.clear();
    if (options.signedIn) {
      localStorage.setItem('theDebateApp', JSON.stringify([{ name: 'token', value: 'jwt' }]));
    }
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideApi(),
        provideHttpClientTesting(),
        provideLocationMocks(),
        provideRouter(appRoutes, withComponentInputBinding()),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppComponent);
    el = fixture.nativeElement;
    router.initialNavigation();
    await router.navigateByUrl(url);
    await settle();
    // The meetings page loads its list on arrival; answer it so the header specs stay about the header.
    http.match('/api/meeting/get').forEach((request) => request.flush([]));
    await settle();
    if (options.signedIn) {
      http.expectOne('/api/user/current').flush({ id: 1, name: 'Jordan Reyes' });
      await settle();
    }
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const avatar = (): HTMLButtonElement | null => el.querySelector('button.avatar');
  const menu = (): HTMLElement | null => el.querySelector('ui-account-menu ul.menu');
  const text = (selector: string): string | undefined => el.querySelector(selector)?.textContent?.trim();

  describe('routes (L2-019, L2-031/5)', () => {
    it('L2-019/1: the root path renders the home page lazily loaded from the home project', async () => {
      await start('/');
      expect(text('h1')).toBe('The Debate App');
      expect(el.querySelector('ui-home-page')).not.toBeNull();
    });

    it('L2-019/2: /login renders the sign-in page', async () => {
      await start('/login');
      expect(el.querySelector('ui-login')).not.toBeNull();
    });

    it('L2-031/5: a path that matches no route renders the not-found page', async () => {
      await start('/nowhere');
      expect(text('h1')).toBe("We can't find that page");
    });

    it('L2-019/7: a non-numeric meeting id that no route claims renders the not-found page', async () => {
      await start('/meeting/abc');
      expect(el.querySelector('ui-not-found-page')).not.toBeNull();
    });

    it('L2-019/3: /meetings renders the meeting list, lazily loaded from the meetings project', async () => {
      await start('/meetings');
      expect(el.querySelector('ui-meeting-list')).not.toBeNull();
      expect(text('h1')).toBe('Meetings');
    });

    it('L2-019/4, L2-031/3: /meeting/create renders the empty create form', async () => {
      await start('/meeting/create');
      expect(el.querySelector('ui-meeting-edit')).not.toBeNull();
      expect(text('h1')).toBe('Create Meeting');
    });

    it('L2-019/5, L2-031/1: /meeting/{n} renders the read-only view', async () => {
      await start('/meeting/4');
      http.expectOne('/api/meeting/getById?id=4').flush({ id: 4, name: 'Four', date: '', start: '', end: '', abstract: '', agenda: '', minutes: '' });
      await settle();
      expect(el.querySelector('ui-meeting-view')).not.toBeNull();
      expect(text('h1')).toBe('Four');
    });

    it('L2-031/2: /meeting/{n}/edit renders the edit form for that meeting', async () => {
      await start('/meeting/4/edit');
      http.expectOne('/api/meeting/getById?id=4').flush({ id: 4, name: 'Four', date: '', start: '', end: '', abstract: '', agenda: '', minutes: '' });
      await settle();
      expect(el.querySelector('ui-meeting-edit')).not.toBeNull();
      expect(text('h1')).toBe('Edit Meeting');
    });

    it('L2-019/6: /meeting/{n}/updateminutes renders no meeting view and falls to not-found', async () => {
      await start('/meeting/4/updateminutes');
      expect(el.querySelector('ui-not-found-page')).not.toBeNull();
      expect(el.querySelector('ui-meeting-view, ui-meeting-edit')).toBeNull();
    });

    it('keeps a toast region in the shell so saves and deletes can announce themselves', async () => {
      await start('/');
      expect(el.querySelector('ui-toast-region .toast-region[aria-live="polite"]')).not.toBeNull();
    });

    it.each([
      ['/forbidden', 'Sign in to continue'],
      ['/server-error', 'Something went wrong on our side'],
      ['/offline', "You're offline"],
    ])('%s renders its status page', async (url, title) => {
      await start(url);
      expect(text('h1')).toBe(title);
    });

    it('L2-019/8: only one routed view is present after a route change', async () => {
      await start('/server-error');
      await router.navigateByUrl('/offline');
      await settle();
      expect(el.querySelectorAll('router-outlet + *').length).toBe(1);
      expect(el.querySelector('ui-server-error-page')).toBeNull();
    });

    it('L2-019/9: navigating pushes history and back re-resolves the previous route', async () => {
      await start('/server-error');
      await router.navigateByUrl('/offline');
      await settle();
      const location = TestBed.inject(Location);
      expect(location.path()).toBe('/offline');
      location.back();
      await vi.waitFor(() => expect(router.url).toBe('/server-error'));
      await settle();
      expect(text('h1')).toBe('Something went wrong on our side');
    });
  });

  describe('header (L2-033)', () => {
    it('L2-033/1: shows the title linking to / and links to /meetings and /meeting/create', async () => {
      await start('/server-error');
      expect(text('ui-header h2')).toBe('The Debate App');
      expect(el.querySelector('ui-header h2 a')?.getAttribute('href')).toBe('/');
      const links = Array.from(el.querySelectorAll('ui-header nav a')).map((a) => [a.textContent?.trim(), a.getAttribute('href')]);
      expect(links).toEqual([
        ['Meetings', '/meetings'],
        ['New meeting', '/meeting/create'],
      ]);
    });

    it('L2-033/1: choosing the title navigates to /', async () => {
      await start('/server-error');
      el.querySelector<HTMLElement>('ui-header h2')!.click();
      await settle();
      expect(router.url).toBe('/');
    });

    it('L2-019 / L1-010: the active nav link follows the current path', async () => {
      await start('/meetings');
      const active = (): string[] =>
        Array.from(el.querySelectorAll('ui-header ui-link.active')).map((l) => l.textContent?.trim() ?? '');
      expect(active()).toEqual(['Meetings']);
      await router.navigateByUrl('/server-error');
      await settle();
      expect(active()).toEqual([]);
    });

    it('is hidden on the home and sign-in pages, which use the full-page layout of the mocks', async () => {
      await start('/');
      expect(el.querySelector('ui-header')).toBeNull();
      await router.navigateByUrl('/login');
      await settle();
      expect(el.querySelector('ui-header')).toBeNull();
      await router.navigateByUrl('/offline');
      await settle();
      expect(el.querySelector('ui-header')).not.toBeNull();
    });

    it('offers a skip link to the main content', async () => {
      await start('/offline');
      expect(el.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main');
    });

    it('L2-033/2: when not signed in shows a link to /login and no avatar', async () => {
      await start('/server-error');
      expect(avatar()).toBeNull();
      const login = Array.from(el.querySelectorAll('ui-header ui-link a')).find((a) => a.textContent?.trim() === 'Login');
      expect(login?.getAttribute('href')).toBe('/login');
    });

    it('L2-033/2: when signed in loads the current user and shows an avatar instead of the login link', async () => {
      await start('/server-error', { signedIn: true });
      expect(avatar()?.textContent?.trim()).toBe('J');
      expect(Array.from(el.querySelectorAll('ui-header ui-link a')).some((a) => a.textContent?.trim() === 'Login')).toBe(false);
    });
  });

  describe('account menu (L2-033/2, L2-032/1)', () => {
    it('the avatar opens the menu showing the name and username', async () => {
      await start('/server-error', { signedIn: true });
      expect(menu()).toBeNull();
      avatar()!.click();
      await settle();
      expect(menu()?.textContent).toContain('Jordan Reyes');
    });

    it('ArrowDown on the avatar opens the menu', async () => {
      await start('/server-error', { signedIn: true });
      avatar()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await settle();
      expect(menu()).not.toBeNull();
    });

    it('Escape closes the menu and returns focus to the avatar', async () => {
      await start('/server-error', { signedIn: true });
      avatar()!.click();
      await settle();
      menu()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(menu()).toBeNull();
      expect(document.activeElement).toBe(avatar());
    });

    it('a click outside the menu closes it', async () => {
      await start('/server-error', { signedIn: true });
      avatar()!.click();
      await settle();
      document.body.click();
      await settle();
      expect(menu()).toBeNull();
    });

    it('L2-032/1: Sign out removes the token and shows sign in in its signed-out state', async () => {
      await start('/server-error', { signedIn: true });
      avatar()!.click();
      await settle();
      el.querySelector<HTMLButtonElement>('ui-account-menu [role="menuitem"]')!.click();
      await settle();
      expect(TestBed.inject(SessionService).get({ name: 'token' })).toBeNull();
      expect(router.url).toBe('/login?state=signed-out');
      expect(text('.alert--success')).toContain("You're signed out");
      expect(menu()).toBeNull();
      expect(avatar()).toBeNull();
    });
  });

  describe('session expiry (L2-032/2, L2-025)', () => {
    it('a 401 on an authenticated request removes the token and shows sign in in its expired state, returning to the page', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await start('/server-error', { signedIn: true });
      TestBed.inject(ApiClient).request('GET', 'meeting/get').subscribe({ error: () => undefined });
      http.expectOne('/api/meeting/get').flush('', { status: 401, statusText: 'Unauthorized' });
      await settle();
      expect(TestBed.inject(SessionService).get({ name: 'token' })).toBeNull();
      expect(router.url).toBe('/login?state=expired&returnUrl=%2Fserver-error');
      expect(text('.alert--info .alert__title')).toBe('Your session ended');
    });
  });

  describe('connectivity banners (L2-025/5)', () => {
    it('shows a persistent offline warning with no dismiss control', async () => {
      await start('/server-error');
      expect(el.querySelector('ui-banner')).toBeNull();
      TestBed.inject(ConnectivityService).reportOffline();
      await settle();
      const banner = el.querySelector('ui-banner .alert--warning')!;
      expect(banner.querySelector('.alert__title')?.textContent?.trim()).toBe("You're offline.");
      expect(banner.textContent).toContain("Changes can't be saved until the connection is back.");
      expect(banner.querySelector('button.close')).toBeNull();
    });

    it('replaces it with a success banner on recovery that dismisses itself after 8 seconds', async () => {
      await start('/server-error');
      vi.useFakeTimers();
      const connectivity = TestBed.inject(ConnectivityService);
      connectivity.reportOffline();
      await settle();
      connectivity.reportOnline();
      await settle();
      expect(el.querySelector('ui-banner .alert--warning')).toBeNull();
      expect(text('ui-banner .alert--success .alert__title')).toBe("You're back online.");
      expect(el.querySelector('ui-banner')?.textContent).toContain('Everything is up to date.');
      vi.advanceTimersByTime(8000);
      await settle();
      expect(el.querySelector('ui-banner')).toBeNull();
    });

    it('the success banner can be dismissed', async () => {
      await start('/server-error');
      const connectivity = TestBed.inject(ConnectivityService);
      connectivity.reportOffline();
      await settle();
      connectivity.reportOnline();
      await settle();
      el.querySelector<HTMLButtonElement>('ui-banner button.close')!.click();
      await settle();
      expect(el.querySelector('ui-banner')).toBeNull();
    });
  });
});
