// Traces to: L2-033, L2-032
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountMenuComponent } from './account-menu.component';

@Component({
  imports: [AccountMenuComponent],
  template: `<ui-account-menu
    name="Jordan Reyes"
    username="admin"
    (signOut)="signOuts = signOuts + 1"
    (dismiss)="dismissals = dismissals + 1"
  />`,
})
class Host {
  signOuts = 0;
  dismissals = 0;
}

describe('AccountMenuComponent (L2-033/2, L2-032/1)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const menu = (): HTMLElement => el.querySelector('ul.menu')!;
  const item = (): HTMLButtonElement => el.querySelector('button[role="menuitem"]')!;

  it('is a labelled menu showing who is signed in', () => {
    expect(menu().getAttribute('role')).toBe('menu');
    expect(menu().getAttribute('aria-label')).toBe('Account');
    expect(menu().textContent).toContain('Jordan Reyes');
    expect(menu().textContent).toContain('@admin');
  });

  it('L2-032/1: Sign out emits signOut', () => {
    expect(item().textContent?.trim()).toBe('Sign out');
    item().click();
    expect(host.signOuts).toBe(1);
  });

  it('moves focus to the first menu item when it opens', () => {
    expect(document.activeElement).toBe(item());
  });

  it('arrow keys move focus between items and wrap', () => {
    menu().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(item());
    menu().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(item());
  });

  it('Escape emits dismiss', () => {
    menu().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(host.dismissals).toBe(1);
  });

  it('Tab leaves the menu by emitting dismiss', () => {
    menu().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(host.dismissals).toBe(1);
  });
});
