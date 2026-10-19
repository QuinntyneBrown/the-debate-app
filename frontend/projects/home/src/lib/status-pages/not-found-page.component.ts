import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatusMessageComponent } from '@the-debate-app/components';

/** Shown when a path matches no route. */
@Component({
  selector: 'ui-not-found-page',
  imports: [RouterLink, StatusMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main" class="container">
      <ui-status-message
        title="We can't find that page"
        text="The link may be old, or the meeting may have been deleted."
      >
        <svg icon class="icon" aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <a class="btn btn--primary" routerLink="/meetings">Back to meetings</a>
      </ui-status-message>
    </main>
  `,
})
export class NotFoundPageComponent {}
