// Traces to: L2-025, L2-032
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerComponent } from './banner.component';

type Tone = 'info' | 'success' | 'warning' | 'danger';

@Component({
  imports: [BannerComponent],
  template: `<ui-banner
    [tone]="tone()"
    [persistent]="persistent()"
    [title]="'Your session ends in 5 minutes.'"
    [actionLabel]="actionLabel()"
    (dismiss)="dismissed = dismissed + 1"
    (action)="actions = actions + 1"
    >Save your work.</ui-banner
  >`,
})
class Host {
  tone = signal<Tone>('warning');
  persistent = signal(false);
  actionLabel = signal('');
  dismissed = 0;
  actions = 0;
}

describe('BannerComponent (L2-025/5 offline banner, L2-032 session notices)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  const banner = (): HTMLElement => el.querySelector('.alert.banner')!;

  it('renders the title and the projected text with the tone class', () => {
    expect(banner().classList).toContain('alert--warning');
    expect(el.querySelector('.alert__title')?.textContent?.trim()).toBe('Your session ends in 5 minutes.');
    expect(el.querySelector('.alert__body')?.textContent).toContain('Save your work.');
  });

  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'status'],
    ['danger', 'alert'],
  ] as const)('tone %s uses role %s', async (tone, role) => {
    host.tone.set(tone);
    fixture.detectChanges();
    expect(banner().classList).toContain('alert--' + tone);
    expect(banner().getAttribute('role')).toBe(role);
  });

  it('shows a dismiss control that emits dismiss', () => {
    const close = el.querySelector<HTMLButtonElement>('button.close')!;
    expect(close.getAttribute('aria-label')).toBe('Dismiss');
    close.click();
    expect(host.dismissed).toBe(1);
  });

  it('a persistent banner has no dismiss control', () => {
    host.persistent.set(true);
    fixture.detectChanges();
    expect(el.querySelector('button.close')).toBeNull();
  });

  it('shows an action button only when an action label is given, and emits action', () => {
    expect(el.querySelector('.alert__actions button')).toBeNull();
    host.actionLabel.set('Stay signed in');
    fixture.detectChanges();
    const action = el.querySelector<HTMLButtonElement>('.alert__actions button')!;
    expect(action.textContent?.trim()).toBe('Stay signed in');
    action.click();
    expect(host.actions).toBe(1);
  });
});
