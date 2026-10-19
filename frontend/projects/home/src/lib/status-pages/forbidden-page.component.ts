import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusMessageComponent } from '@the-debate-app/components';

/** Shown when a protected endpoint answered 401; Sign in returns to the page that was asked for. */
@Component({
  selector: 'ui-forbidden-page',
  imports: [RouterLink, StatusMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main" class="container">
      <ui-status-message
        title="Sign in to continue"
        text="That page needs you to be signed in. Your session may have ended."
      >
        <svg icon class="icon" aria-hidden="true" viewBox="0 0 24 24">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <a class="btn btn--primary" routerLink="/login" [queryParams]="{ state: 'expired', returnUrl: returnUrl() }">Sign in</a>
      </ui-status-message>
    </main>
  `,
})
export class ForbiddenPageComponent {
  /** The page the person asked for; bound from the `returnUrl` query parameter. */
  readonly returnUrl = input<string | undefined>(undefined);
}
