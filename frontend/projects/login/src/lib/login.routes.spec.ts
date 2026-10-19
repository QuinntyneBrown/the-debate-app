// Traces to: L2-019
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideApi } from '@the-debate-app/api';
import { LoginComponent } from './login/login.component';
import { LOGIN_ROUTES } from './login.routes';

describe('LOGIN_ROUTES (L2-019/2)', () => {
  it('renders the sign-in page for /login and binds state and returnUrl from the query string', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideApi(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: LOGIN_ROUTES }], withComponentInputBinding()),
      ],
    });
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/login?state=expired&returnUrl=%2Fmeetings', LoginComponent);
    harness.detectChanges();
    expect(page.state()).toBe('expired');
    expect(page.returnUrl()).toBe('/meetings');
    expect((harness.routeNativeElement as HTMLElement).querySelector('h1')?.textContent?.trim()).toBe('Sign in');
  });
});
