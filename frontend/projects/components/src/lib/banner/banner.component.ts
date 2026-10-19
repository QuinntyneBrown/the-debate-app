import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

/** Page-wide message: tone, title, projected text, optional action and dismiss control. */
@Component({
  selector: 'ui-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'alert alert--' + tone() + ' banner'" [attr.role]="role()">
      <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <div class="alert__body">
        <div class="alert__title">{{ title() }}</div>
        <div><ng-content /></div>
        @if (actionLabel()) {
          <div class="alert__actions">
            <button type="button" class="btn btn--sm" (click)="action.emit()">{{ actionLabel() }}</button>
          </div>
        }
      </div>
      @if (!persistent()) {
        <button class="close" type="button" aria-label="Dismiss" (click)="dismiss.emit()">
          <svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
  `,
})
export class BannerComponent {
  readonly tone = input<BannerTone>('info');
  /** A persistent banner has no dismiss control. */
  readonly persistent = input(false);
  readonly title = input('');
  readonly actionLabel = input('');
  readonly dismiss = output<void>();
  readonly action = output<void>();

  protected readonly role = computed(() => (this.tone() === 'danger' ? 'alert' : 'status'));
}
