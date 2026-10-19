import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';
import { trapTab } from './dialog-focus';

/** Asks whether to leave the edit form with unsaved changes; Keep editing is primary and holds focus. */
@Component({
  selector: 'ui-discard-changes-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop"></div>
    <div
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-title"
      aria-describedby="discard-desc"
      (keydown)="onKeydown($event)"
    >
      <div #panel class="dialog__panel">
        <div class="dialog__header">
          <div style="flex: 1">
            <h2 class="dialog__title" id="discard-title">Leave without saving?</h2>
            <p id="discard-desc" class="text-muted" style="margin-top: var(--space-1)">Your changes to “{{ name() }}” will be lost.</p>
          </div>
          <button class="btn btn--ghost btn--icon" type="button" aria-label="Close" (click)="keepEditing.emit()">
            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div class="dialog__footer">
          <button class="btn btn--danger" type="button" (click)="discard.emit()">Discard</button>
          <button #keep class="btn btn--primary" type="button" (click)="keepEditing.emit()">Keep editing</button>
        </div>
      </div>
    </div>
  `,
})
export class DiscardChangesDialogComponent {
  /** Name of the meeting whose changes would be lost. */
  readonly name = input('');
  readonly discard = output<void>();
  readonly keepEditing = output<void>();

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly keep = viewChild.required<ElementRef<HTMLButtonElement>>('keep');

  constructor() {
    afterNextRender(() => this.keep().nativeElement.focus());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.keepEditing.emit();
    } else {
      trapTab(event, this.panel().nativeElement);
    }
  }
}
