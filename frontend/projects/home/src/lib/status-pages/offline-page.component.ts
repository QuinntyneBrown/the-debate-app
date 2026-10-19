import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { StatusMessageComponent } from '@the-debate-app/components';

/** Shown when the first request fails with no network. */
@Component({
  selector: 'ui-offline-page',
  imports: [StatusMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main" class="container">
      <ui-status-message title="You're offline" text="Meetings will load again when the connection is back.">
        <svg icon class="icon" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M3 3l18 18M5 12.5a10 10 0 0 1 4-2.3M2 9a15 15 0 0 1 5-3M12 20h.01M8.5 16a5 5 0 0 1 5.5-1" />
        </svg>
        <button class="btn btn--primary" type="button" (click)="retry()">Try again</button>
      </ui-status-message>
    </main>
  `,
})
export class OfflinePageComponent {
  private readonly router = inject(Router);

  /** The page that failed; bound from the `returnUrl` query parameter. */
  readonly returnUrl = input<string | undefined>(undefined);

  protected retry(): void {
    void this.router.navigateByUrl(this.returnUrl() || '/meetings');
  }
}
