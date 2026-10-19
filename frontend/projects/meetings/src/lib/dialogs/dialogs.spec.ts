// Traces to: L2-023, L2-024, L2-034
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DeleteMeetingDialogComponent, DeleteDialogState } from './delete-meeting-dialog.component';
import { DiscardChangesDialogComponent } from './discard-changes-dialog.component';

@Component({
  imports: [DeleteMeetingDialogComponent, DiscardChangesDialogComponent],
  template: `
    @if (showDelete()) {
    <ui-delete-meeting-dialog [name]="'Universal basic income'" [state]="state()" (confirm)="log.push('confirm')" (cancel)="log.push('cancel')" />
    }
    @if (!showDelete()) {
    <ui-discard-changes-dialog [name]="'Universal basic income'" (discard)="log.push('discard')" (keepEditing)="log.push('keep')" />
    }
  `,
})
class Host {
  state = signal<DeleteDialogState>('default');
  showDelete = signal(true);
  log: string[] = [];
}

describe('meeting dialogs', () => {
  let el: HTMLElement;
  let host: Host;
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>;
  const del = () => el.querySelector('ui-delete-meeting-dialog')!;
  const discard = () => el.querySelector('ui-discard-changes-dialog')!;
  const buttonByText = (root: Element, text: string) =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === text)!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    document.body.appendChild(el);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => el.remove());

  describe('delete meeting (L2-023/4, L2-024/7)', () => {
    it('default: modal dialog with the title, consequence and focus on Cancel', () => {
      const dialog = del().querySelector('[role="dialog"]')!;
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(del().querySelector('.dialog__title')?.textContent).toBe('Delete “Universal basic income”?');
      expect(del().textContent).toContain("It disappears from the list for everyone. There's no undo.");
      expect(document.activeElement).toBe(buttonByText(del(), 'Cancel'));
    });

    it('confirms with Delete meeting and cancels with Cancel, Close and Escape', () => {
      buttonByText(del(), 'Delete meeting').click();
      buttonByText(del(), 'Cancel').click();
      del().querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
      del().querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(host.log).toEqual(['confirm', 'cancel', 'cancel', 'cancel']);
    });

    it('busy: the action reads Deleting… and Cancel is disabled', () => {
      host.state.set('busy');
      fixture.detectChanges();
      expect(buttonByText(del(), 'Deleting…').getAttribute('aria-busy')).toBe('true');
      expect(buttonByText(del(), 'Cancel').disabled).toBe(true);
      del().querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(host.log).toEqual([]);
    });

    it('failed: shows the reason inside the dialog and offers Try again', () => {
      host.state.set('failed');
      fixture.detectChanges();
      expect(del().querySelector('.alert--danger')?.textContent).toContain("We couldn't delete it");
      expect(del().querySelector('.alert--danger')?.textContent).toContain('Check your connection and try again.');
      buttonByText(del(), 'Try again').click();
      expect(host.log).toEqual(['confirm']);
    });
  });

  describe('discard changes (L2-034/3)', () => {
    beforeEach(async () => {
      host.showDelete.set(false);
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('names the meeting, makes Keep editing primary and focused', () => {
      expect(discard().querySelector('.dialog__title')?.textContent).toBe('Leave without saving?');
      expect(discard().textContent).toContain('Your changes to “Universal basic income” will be lost.');
      const keep = buttonByText(discard(), 'Keep editing');
      expect(keep.classList.contains('btn--primary')).toBe(true);
      expect(document.activeElement).toBe(keep);
      expect(buttonByText(discard(), 'Discard').classList.contains('btn--danger')).toBe(true);
    });

    it('Discard discards; Keep editing, Close and Escape keep editing', () => {
      buttonByText(discard(), 'Discard').click();
      buttonByText(discard(), 'Keep editing').click();
      discard().querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
      discard().querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(host.log).toEqual(['discard', 'keep', 'keep', 'keep']);
    });
  });
});
