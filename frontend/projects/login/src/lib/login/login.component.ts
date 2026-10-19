import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiError, AuthService } from '@the-debate-app/api';

export type LoginState = 'default' | 'invalid' | 'submitting' | 'error' | 'expired' | 'signed-out';

/** Sign-in page: username and password, with the six states of the sign-in mocks. */
@Component({
  selector: 'ui-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main" class="auth-layout">
      <div class="auth-card stack">
        <div class="logo" aria-hidden="true">
          <span class="logo-mark" style="background: var(--color-accent-subtle); color: var(--color-fg-accent)">
            <svg class="icon icon--lg" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4 5h9a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H9l-4 3v-3a3 3 0 0 1-1-2.2V8a3 3 0 0 1 0-3z" />
              <path d="M16 9h2a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-1l-3 3v-3" />
            </svg>
          </span>
        </div>
        <div class="card stack">
          <h1 style="text-align: center">Sign in</h1>
          <form class="stack" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            @switch (pageState()) {
              @case ('invalid') {
                <div #summary class="alert alert--danger form-summary" role="alert" id="summary" tabindex="-1">
                  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <div class="alert__body">
                    <div class="alert__title">We couldn't sign you in</div>
                    <div class="alert__actions"><a href="#password">Check the password</a></div>
                  </div>
                </div>
              }
              @case ('error') {
                <div class="alert alert--danger" role="alert">
                  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <div class="alert__body">
                    <div class="alert__title">We couldn't reach the server</div>
                    <div>Your details are still here.</div>
                  </div>
                </div>
              }
              @case ('expired') {
                <div class="alert alert--info" role="status">
                  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8h.01M12 11v5" />
                  </svg>
                  <div class="alert__body">
                    <div class="alert__title">Your session ended</div>
                    <div>Sign in again to carry on where you were.</div>
                  </div>
                </div>
              }
              @case ('signed-out') {
                <div class="alert alert--success" role="status">
                  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12.5l3 3 5-6" />
                  </svg>
                  <div class="alert__body">
                    <div class="alert__title">You're signed out</div>
                  </div>
                </div>
              }
            }
            <div class="field">
              <label class="field__label" for="username">Username</label>
              <input
                class="input"
                id="username"
                name="username"
                type="text"
                formControlName="username"
                autocomplete="username"
                autocapitalize="none"
                spellcheck="false"
                autofocus
                [readOnly]="submitting()"
                (input)="dismissNotice()"
              />
            </div>
            <div class="field">
              <label class="field__label" for="password">Password</label>
              <div class="input-group">
                <input
                  class="input"
                  id="password"
                  name="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  [readOnly]="submitting()"
                  [attr.aria-invalid]="pageState() === 'invalid' ? 'true' : null"
                  [attr.aria-describedby]="pageState() === 'invalid' ? 'password-error' : null"
                  (input)="dismissNotice()"
                />
                <button
                  class="btn btn--ghost btn--icon input-group__btn"
                  type="button"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                  [attr.aria-pressed]="showPassword()"
                  [disabled]="submitting()"
                  (click)="showPassword.set(!showPassword())"
                >
                  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
              @if (pageState() === 'invalid') {
                <div class="field__error" id="password-error">Username or password is wrong.</div>
              }
            </div>
            <button
              class="btn btn--primary btn--lg btn--block"
              type="submit"
              [attr.aria-busy]="submitting() ? 'true' : null"
            >
              {{ buttonLabel() }}
            </button>
          </form>
        </div>
      </div>
    </main>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');

  /** A notice carried over from the shell: `expired` after a 401, `signed-out` after Sign out. */
  readonly state = input<string | undefined>(undefined);
  /** The page to reopen after a successful sign in. */
  readonly returnUrl = input<string | undefined>(undefined);

  protected readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });
  protected readonly showPassword = signal(false);

  private readonly outcome = signal<'idle' | 'submitting' | 'invalid' | 'error'>('idle');
  private readonly noticeDismissed = signal(false);

  protected readonly pageState = computed<LoginState>(() => {
    const outcome = this.outcome();
    if (outcome !== 'idle') return outcome;
    const notice = this.state();
    return !this.noticeDismissed() && (notice === 'expired' || notice === 'signed-out') ? notice : 'default';
  });
  protected readonly submitting = computed(() => this.pageState() === 'submitting');
  protected readonly buttonLabel = computed(() => {
    switch (this.pageState()) {
      case 'submitting':
        return 'Signing in…';
      case 'error':
        return 'Try again';
      default:
        return 'Sign in';
    }
  });

  protected dismissNotice(): void {
    this.noticeDismissed.set(true);
  }

  protected submit(): void {
    if (this.submitting()) return;
    this.outcome.set('submitting');
    this.auth.tryToLogin(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl(this.destination()),
      error: (error: unknown) => {
        const offline = error instanceof ApiError && (error.kind === 'offline' || error.kind === 'server');
        this.outcome.set(offline ? 'error' : 'invalid');
        if (!offline) afterNextRender(() => this.summary()?.nativeElement.focus(), { injector: this.injector });
      },
    });
  }

  private destination(): string {
    const target = this.returnUrl();
    return target && /^\/(?!\/)/.test(target) ? target : '/meetings';
  }
}
