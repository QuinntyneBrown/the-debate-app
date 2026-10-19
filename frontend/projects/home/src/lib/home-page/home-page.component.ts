import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Landing page: the logo mark, the tagline and one way in. */
@Component({
  selector: 'ui-home-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main" class="auth-layout">
      <div class="auth-card stack" style="text-align: center; align-items: center">
        <span class="logo-mark" style="background: var(--color-accent-subtle); color: var(--color-fg-accent)" aria-hidden="true">
          <svg class="icon icon--lg" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 5h9a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H9l-4 3v-3a3 3 0 0 1-1-2.2V8a3 3 0 0 1 0-3z" />
            <path d="M16 9h2a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-1l-3 3v-3" />
          </svg>
        </span>
        <h1>The Debate App</h1>
        <p class="text-muted">Meetings, agendas and minutes for the club.</p>
        <a class="btn btn--primary btn--lg" routerLink="/meetings" style="margin-top: var(--space-2)">Enter</a>
      </div>
    </main>
  `,
})
export class HomePageComponent {}
