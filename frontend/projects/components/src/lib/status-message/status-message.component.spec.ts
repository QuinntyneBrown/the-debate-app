// Traces to: L2-031, L2-019
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusMessageComponent } from './status-message.component';

@Component({
  imports: [StatusMessageComponent],
  template: `<ui-status-message [title]="'We cannot find that page'" [text]="'The link may be old.'" [tone]="tone()">
    <svg icon class="icon" aria-hidden="true"></svg>
    <button type="button" class="btn">Back to meetings</button>
  </ui-status-message>`,
})
class Host {
  tone = signal<'default' | 'error'>('default');
}

describe('StatusMessageComponent (L2-031/5 not-found and status pages)', () => {
  let fixture: ComponentFixture<Host>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders an h1 title, the text, the icon and the projected actions', () => {
    expect(el.querySelector('h1.empty__title')?.textContent?.trim()).toBe('We cannot find that page');
    expect(el.querySelector('.empty__text')?.textContent?.trim()).toBe('The link may be old.');
    expect(el.querySelector('.empty__icon svg')).not.toBeNull();
    expect(el.querySelector('.empty__actions button')?.textContent?.trim()).toBe('Back to meetings');
  });

  it('applies the error modifier only for the error tone', () => {
    expect(el.querySelector('.empty')?.classList).not.toContain('empty--error');
    fixture.componentInstance.tone.set('error');
    fixture.detectChanges();
    expect(el.querySelector('.empty')?.classList).toContain('empty--error');
  });
});
