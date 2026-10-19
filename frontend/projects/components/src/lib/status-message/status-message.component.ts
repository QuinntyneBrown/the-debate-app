import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Centred title, text, icon and actions used by the not-found, forbidden, server-error and offline pages. */
@Component({
  selector: 'ui-status-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty" [class.empty--error]="tone() === 'error'" style="padding-top: var(--space-16)">
      <span class="empty__icon"><ng-content select="[icon]" /></span>
      <h1 class="empty__title">{{ title() }}</h1>
      <p class="empty__text">{{ text() }}</p>
      <div class="empty__actions"><ng-content /></div>
    </div>
  `,
  styles: `
    :host { display: block; }
  `,
})
export class StatusMessageComponent {
  readonly title = input('');
  readonly text = input('');
  readonly tone = input<'default' | 'error'>('default');
}
