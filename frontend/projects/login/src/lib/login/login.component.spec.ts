// Traces to: L2-032, L2-013, L2-027
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SessionService, provideApi } from '@the-debate-app/api';
import { LOGIN_ROUTES } from '../login.routes';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let el: HTMLElement;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({
      providers: [
        provideApi(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'meetings', children: [] },
          { path: 'meeting/:id/edit', children: [] },
          { path: 'login', children: LOGIN_ROUTES },
        ]),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  const username = (): HTMLInputElement => el.querySelector('#username')!;
  const password = (): HTMLInputElement => el.querySelector('#password')!;
  const submitButton = (): HTMLButtonElement => el.querySelector('button[type="submit"]')!;
  const type = (input: HTMLInputElement, value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };
  const fill = (u = 'admin', p = 'secret'): void => {
    type(username(), u);
    type(password(), p);
  };
  const submit = (): void => {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  const respond = async (body: object | string, init: { status: number; statusText: string }): Promise<void> => {
    http.expectOne('/api/user/token').flush(body, init);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const invalidCredentials = (): Promise<void> =>
    respond({ error: 'invalid_grant', error_description: 'Invalid credentials' }, { status: 400, statusText: 'Bad Request' });

  describe('default state', () => {
    it('shows a Sign in heading, labelled Username and Password fields and a Sign in button', () => {
      expect(el.querySelector('h1')?.textContent?.trim()).toBe('Sign in');
      expect(el.querySelector('label[for="username"]')?.textContent?.trim()).toBe('Username');
      expect(el.querySelector('label[for="password"]')?.textContent?.trim()).toBe('Password');
      expect(username().hasAttribute('autofocus')).toBe(true);
      expect(username().getAttribute('autocomplete')).toBe('username');
      expect(password().getAttribute('autocomplete')).toBe('current-password');
      expect(password().type).toBe('password');
      expect(submitButton().textContent?.trim()).toBe('Sign in');
      expect(el.querySelector('.alert')).toBeNull();
    });

    it('the show password control toggles the field type and its label', () => {
      const toggle = el.querySelector<HTMLButtonElement>('.input-group__btn')!;
      expect(toggle.getAttribute('aria-label')).toBe('Show password');
      toggle.click();
      fixture.detectChanges();
      expect(password().type).toBe('text');
      expect(toggle.getAttribute('aria-label')).toBe('Hide password');
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('submitting (L2-027/2, L2-032/3)', () => {
    it('L2-027/2: posts the credentials to the token endpoint as a URL-encoded password grant', () => {
      fill('admin', 'p w');
      submit();
      const req = http.expectOne('/api/user/token');
      expect(req.request.body).toBe('username=admin&password=p+w&grant_type=password');
      req.flush({ access_token: 't', token_type: 'bearer', expires_in: 7200 });
    });

    it('shows the submitting state: read-only fields, Signing in… and aria-busy', () => {
      fill();
      submit();
      expect(username().readOnly).toBe(true);
      expect(password().readOnly).toBe(true);
      expect(username().disabled).toBe(false);
      expect(submitButton().textContent?.trim()).toBe('Signing in…');
      expect(submitButton().getAttribute('aria-busy')).toBe('true');
      expect(el.querySelector<HTMLButtonElement>('.input-group__btn')!.disabled).toBe(true);
      http.expectOne('/api/user/token');
    });

    it('does not send a second request while one is in flight', () => {
      fill();
      submit();
      submit();
      http.expectOne('/api/user/token');
    });

    it('L2-032/3: success stores the token under the name token and shows the meetings page', async () => {
      fill();
      submit();
      await respond({ access_token: 'jwt', token_type: 'bearer', expires_in: 7200 }, { status: 200, statusText: 'OK' });
      expect(TestBed.inject(SessionService).get({ name: 'token' })).toBe('jwt');
      expect(router.url).toBe('/meetings');
    });

    it('L2-032/2: after an expired session, success reopens the page the person was on', async () => {
      fixture.componentRef.setInput('state', 'expired');
      fixture.componentRef.setInput('returnUrl', '/meeting/3/edit');
      fixture.detectChanges();
      fill();
      submit();
      await respond({ access_token: 'jwt', token_type: 'bearer', expires_in: 7200 }, { status: 200, statusText: 'OK' });
      expect(router.url).toBe('/meeting/3/edit');
    });

    it('ignores a returnUrl that is not a path inside the app', async () => {
      fixture.componentRef.setInput('returnUrl', '//evil.example/x');
      fixture.detectChanges();
      fill();
      submit();
      await respond({ access_token: 'jwt', token_type: 'bearer', expires_in: 7200 }, { status: 200, statusText: 'OK' });
      expect(router.url).toBe('/meetings');
    });
  });

  describe('invalid state (L2-032/4, L2-013/2-3)', () => {
    beforeEach(async () => {
      fill('admin', 'wrong');
      submit();
      await invalidCredentials();
    });

    it('shows the summary titled "We couldn\'t sign you in", focused, linking to the password field', () => {
      const summary = el.querySelector<HTMLElement>('.alert--danger.form-summary')!;
      expect(summary.getAttribute('role')).toBe('alert');
      expect(summary.querySelector('.alert__title')?.textContent?.trim()).toBe("We couldn't sign you in");
      const link = summary.querySelector<HTMLAnchorElement>('.alert__actions a')!;
      expect(link.textContent?.trim()).toBe('Check the password');
      expect(link.getAttribute('href')).toBe('#password');
      expect(document.activeElement).toBe(summary);
    });

    it('keeps the username and the password and marks the password invalid with its message', () => {
      expect(username().value).toBe('admin');
      expect(password().value).toBe('wrong');
      expect(password().getAttribute('aria-invalid')).toBe('true');
      expect(password().getAttribute('aria-describedby')).toBe('password-error');
      expect(el.querySelector('#password-error')?.textContent?.trim()).toBe('Username or password is wrong.');
    });

    it('does not store a token or leave the page, and the fields are editable again', () => {
      expect(TestBed.inject(SessionService).get({ name: 'token' })).toBeNull();
      expect(router.url).toBe('/');
      expect(username().readOnly).toBe(false);
      expect(submitButton().textContent?.trim()).toBe('Sign in');
    });
  });

  describe('error state (network failure)', () => {
    beforeEach(async () => {
      fill('admin', 'secret');
      submit();
      http.expectOne('/api/user/token').error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('says the server could not be reached, keeps the details and relabels the button Try again', () => {
      const alert = el.querySelector('.alert--danger')!;
      expect(alert.getAttribute('role')).toBe('alert');
      expect(alert.querySelector('.alert__title')?.textContent?.trim()).toBe("We couldn't reach the server");
      expect(alert.textContent).toContain('Your details are still here.');
      expect(username().value).toBe('admin');
      expect(password().value).toBe('secret');
      expect(el.querySelector('.form-summary')).toBeNull();
      expect(submitButton().textContent?.trim()).toBe('Try again');
    });

    it('Try again sends the same credentials again', () => {
      submit();
      const req = http.expectOne('/api/user/token');
      expect(req.request.body).toBe('username=admin&password=secret&grant_type=password');
      req.flush({ access_token: 't', token_type: 'bearer', expires_in: 7200 });
    });
  });

  it('a server failure is also shown as the error state', async () => {
    fill();
    submit();
    await respond('', { status: 503, statusText: 'Service Unavailable' });
    expect(el.querySelector('.alert__title')?.textContent?.trim()).toBe("We couldn't reach the server");
  });

  describe('expired state (L2-032/2)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('state', 'expired');
      fixture.detectChanges();
    });

    it('shows the info notice "Your session ended"', () => {
      const alert = el.querySelector('.alert--info')!;
      expect(alert.getAttribute('role')).toBe('status');
      expect(alert.querySelector('.alert__title')?.textContent?.trim()).toBe('Your session ended');
      expect(alert.textContent).toContain('Sign in again to carry on where you were.');
      expect(submitButton().textContent?.trim()).toBe('Sign in');
    });
  });

  describe('signed-out state (L2-032/1)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('state', 'signed-out');
      fixture.detectChanges();
    });

    it('shows the success notice "You\'re signed out"', () => {
      const alert = el.querySelector('.alert--success')!;
      expect(alert.getAttribute('role')).toBe('status');
      expect(alert.textContent).toContain("You're signed out");
    });

    it('clears the notice when typing starts', () => {
      type(username(), 'a');
      expect(el.querySelector('.alert')).toBeNull();
    });
  });
});
