// Traces to: L2-031, L2-032, L2-019
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { HOME_ROUTES } from '../home.routes';
import { STATUS_ROUTES } from '../status.routes';
import { ForbiddenPageComponent } from './forbidden-page.component';
import { NotFoundPageComponent } from './not-found-page.component';
import { OfflinePageComponent } from './offline-page.component';
import { ServerErrorPageComponent } from './server-error-page.component';

describe('status pages', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([...HOME_ROUTES, { path: 'meetings', children: [] }, { path: 'login', children: [] }, ...STATUS_ROUTES], withComponentInputBinding()),
      ],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  const el = (): HTMLElement => harness.routeNativeElement as HTMLElement;

  describe('not found', () => {
    it('L2-031/5: a path that matches no route renders the not-found page', async () => {
      await harness.navigateByUrl('/no/such/page', NotFoundPageComponent);
      expect(el().querySelector('h1')?.textContent?.trim()).toBe("We can't find that page");
      expect(el().querySelector('.empty__text')?.textContent?.trim()).toBe(
        'The link may be old, or the meeting may have been deleted.',
      );
    });

    it('L2-019/7: a non-numeric meeting id renders the not-found page when no route claims it', async () => {
      await harness.navigateByUrl('/meeting/abc', NotFoundPageComponent);
      expect(el().querySelector('h1')).not.toBeNull();
    });

    it('offers Back to meetings', async () => {
      await harness.navigateByUrl('/nowhere', NotFoundPageComponent);
      const back = el().querySelector<HTMLAnchorElement>('a.btn.btn--primary')!;
      expect(back.textContent?.trim()).toBe('Back to meetings');
      back.click();
      await harness.fixture.whenStable();
      expect(router.url).toBe('/meetings');
    });
  });

  describe('forbidden', () => {
    it('L2-032/2: explains that sign in is needed and links to sign in in the expired state', async () => {
      await harness.navigateByUrl('/forbidden', ForbiddenPageComponent);
      expect(el().querySelector('h1')?.textContent?.trim()).toBe('Sign in to continue');
      expect(el().querySelector('.empty__text')?.textContent?.trim()).toBe(
        'That page needs you to be signed in. Your session may have ended.',
      );
      const signIn = el().querySelector<HTMLAnchorElement>('a.btn.btn--primary')!;
      expect(signIn.textContent?.trim()).toBe('Sign in');
      expect(signIn.getAttribute('href')).toBe('/login?state=expired');
    });

    it('L2-032/2: passes the requested page as returnUrl so sign in returns to it', async () => {
      await harness.navigateByUrl('/forbidden?returnUrl=%2Fmeeting%2F3%2Fedit', ForbiddenPageComponent);
      const signIn = el().querySelector<HTMLAnchorElement>('a.btn.btn--primary')!;
      expect(signIn.getAttribute('href')).toBe('/login?state=expired&returnUrl=%2Fmeeting%2F3%2Fedit');
    });
  });

  describe('server error', () => {
    it('shows the error tone, Try again and Back to meetings', async () => {
      await harness.navigateByUrl('/server-error', ServerErrorPageComponent);
      expect(el().querySelector('.empty')?.classList).toContain('empty--error');
      expect(el().querySelector('h1')?.textContent?.trim()).toBe('Something went wrong on our side');
      expect(el().querySelector('.empty__text')?.textContent?.trim()).toBe(
        'Try again in a moment. If it keeps happening, tell Jordan.',
      );
      const buttons = Array.from(el().querySelectorAll('.empty__actions > *')).map((b) => b.textContent?.trim());
      expect(buttons).toEqual(['Try again', 'Back to meetings']);
    });

    it('Try again returns to the page that failed (returnUrl), else to the meeting list', async () => {
      await harness.navigateByUrl('/server-error?returnUrl=%2Flogin', ServerErrorPageComponent);
      el().querySelector<HTMLButtonElement>('button.btn--primary')!.click();
      await harness.fixture.whenStable();
      expect(router.url).toBe('/login');

      await harness.navigateByUrl('/server-error', ServerErrorPageComponent);
      el().querySelector<HTMLButtonElement>('button.btn--primary')!.click();
      await harness.fixture.whenStable();
      expect(router.url).toBe('/meetings');
    });
  });

  describe('offline', () => {
    it("L2-025/5: tells the person they're offline and offers Try again", async () => {
      await harness.navigateByUrl('/offline', OfflinePageComponent);
      expect(el().querySelector('h1')?.textContent?.trim()).toBe("You're offline");
      expect(el().querySelector('.empty__text')?.textContent?.trim()).toBe(
        'Meetings will load again when the connection is back.',
      );
      expect(el().querySelector('.empty--error')).toBeNull();
      expect(el().querySelector('button.btn--primary')?.textContent?.trim()).toBe('Try again');
    });

    it('Try again returns to the page that failed, else to the meeting list', async () => {
      await harness.navigateByUrl('/offline?returnUrl=%2Flogin', OfflinePageComponent);
      el().querySelector<HTMLButtonElement>('button.btn--primary')!.click();
      await harness.fixture.whenStable();
      expect(router.url).toBe('/login');
    });
  });
});
