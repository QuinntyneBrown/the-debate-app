import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LinkComponent } from '../link/link.component';
import { HeaderLink } from './header-link';

/** Application header: title, primary links and the account entry. */
@Component({
  selector: 'ui-header',
  imports: [LinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="topbar">
      <h2 class="topbar__brand" (click)="onTitleClick($event)">
        <a href="/">{{ title() }}</a>
      </h2>
      <nav class="topbar__nav" aria-label="Primary">
        @for (link of links(); track link.label) {
          <ui-link [routeSegments]="link.routeSegments">{{ link.label }}</ui-link>
        }
      </nav>
      <span class="topbar__spacer"></span>
      @if (signedIn()) {
        <button
          type="button"
          class="avatar"
          aria-haspopup="menu"
          aria-label="Account menu"
          (click)="accountClick.emit()"
        >
          {{ initials() }}
        </button>
      } @else {
        <ui-link [routeSegments]="['login']">Login</ui-link>
      }
    </header>
  `,
  styles: `
    :host { display: block; }
    .topbar__brand { cursor: pointer; }
    .topbar__brand a { color: inherit; text-decoration: none; }
    .topbar__nav { display: flex; }
    .avatar {
      display: grid; place-items: center; width: 2.5rem; aspect-ratio: 1;
      border: 0; border-radius: var(--radius-full); background: var(--color-accent-subtle);
      color: var(--color-fg-accent); font: var(--text-label); cursor: pointer;
    }
    .avatar:focus-visible { outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset); }
  `,
})
export class HeaderComponent {
  readonly title = input('');
  readonly links = input<HeaderLink[]>([]);
  readonly signedIn = input(false);
  readonly initials = input('');
  readonly titleClick = output<void>();
  readonly accountClick = output<void>();

  protected onTitleClick(event: Event): void {
    event.preventDefault();
    this.titleClick.emit();
  }
}
