import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StatusMessageComponent } from '@the-debate-app/components';

/** Shown when the API answered with a server error. */
@Component({
  selector: 'ui-server-error-page',
  imports: [RouterLink, StatusMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main" class="container">
      <ui-status-message
        tone="error"
        title="Something went wrong on our side"
        text="Try again in a moment. If it keeps happening, tell Jordan."
      >
        <svg icon class="icon" aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <button class="btn btn--primary" type="button" (click)="retry()">Try again</button>
        <a class="btn" routerLink="/meetings">Back to meetings</a>
      </ui-status-message>
    </main>
  `,
})
export class ServerErrorPageComponent {
  private readonly router = inject(Router);

  /** The page that failed; bound from the `returnUrl` query parameter. */
  readonly returnUrl = input<string | undefined>(undefined);

  protected retry(): void {
    void this.router.navigateByUrl(this.returnUrl() || '/meetings');
  }
}
