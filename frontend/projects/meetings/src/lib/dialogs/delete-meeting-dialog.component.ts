import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';
import { trapTab } from './dialog-focus';

export type DeleteDialogState = 'default' | 'busy' | 'failed';

/** Confirms a soft deletion; focus starts on Cancel, never on the destructive action. */
@Component({
  selector: 'ui-delete-meeting-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop"></div>
    <div
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="del-title"
      aria-describedby="del-desc"
      (keydown)="onKeydown($event)"
    >
      <div #panel class="dialog__panel">
        <div class="dialog__header">
          <div class="dialog__icon dialog__icon--danger" aria-hidden="true">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
          </div>
          <div style="flex: 1">
            <h2 class="dialog__title" id="del-title">Delete “{{ name() }}”?</h2>
            <p id="del-desc" class="text-muted" style="margin-top: var(--space-1)">It disappears from the list for everyone. There's no undo.</p>
          </div>
          <button class="btn btn--ghost btn--icon" type="button" aria-label="Close" [disabled]="state() === 'busy'" (click)="cancel.emit()">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        @if (state() === 'failed') {
          <div class="dialog__body stack">
            <div class="alert alert--danger" role="alert">
              <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
              <div class="alert__body">
                <div class="alert__title">We couldn't delete it</div>
                <div>Check your connection and try again.</div>
              </div>
            </div>
          </div>
        }
        <div class="dialog__footer">
          <button #cancelButton class="btn" type="button" [disabled]="state() === 'busy'" (click)="cancel.emit()">Cancel</button>
          <button
            class="btn btn--danger"
            type="button"
            [attr.aria-busy]="state() === 'busy' ? 'true' : null"
            (click)="confirmIfIdle()"
          >
            @switch (state()) {
              @case ('busy') {
                Deleting…
              }
              @case ('failed') {
                Try again
              }
              @default {
                Delete meeting
              }
            }
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DeleteMeetingDialogComponent {
  readonly name = input('');
  readonly state = input<DeleteDialogState>('default');
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly cancelButton = viewChild.required<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    afterNextRender(() => this.cancelButton().nativeElement.focus());
  }

  protected confirmIfIdle(): void {
    if (this.state() !== 'busy') this.confirm.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (this.state() !== 'busy') this.cancel.emit();
    } else {
      trapTab(event, this.panel().nativeElement);
    }
  }
}
