// Traces to: L2-021, L2-033
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { HeaderLink } from './header-link';

@Component({ template: '' })
class BlankPage {}

@Component({
  imports: [HeaderComponent],
  template: `<ui-header
    [title]="title()"
    [links]="links()"
    [signedIn]="signedIn()"
    (titleClick)="titleClicks = titleClicks + 1"
    (accountClick)="accountClicks = accountClicks + 1"
  />`,
})
class Host {
  title = signal('The Debate App');
  links = signal<HeaderLink[]>([
    { label: 'Meetings', routeSegments: ['meetings'] },
    { label: 'New meeting', routeSegments: ['meeting', 'create'] },
  ]);
  signedIn = signal(false);
  titleClicks = 0;
  accountClicks = 0;
}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<Host>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideRouter([{ path: '**', component: BlankPage }])],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('L2-021/1 (+L2-033/1): shows an h2 with the title and a link per header link', () => {
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('The Debate App');
    const labels = Array.from(el.querySelectorAll('ui-link')).map((l) => l.textContent?.trim());
    expect(labels).toEqual(['Meetings', 'New meeting', 'Login']);
    const hrefs = Array.from(el.querySelectorAll('ui-link a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/meetings', '/meeting/create', '/login']);
  });

  it('L2-021/1: renders the legacy heading and labels when the shell supplies them', () => {
    fixture.componentInstance.title.set('Architecture');
    fixture.componentInstance.links.set([
      { label: 'MEETINGS', routeSegments: ['meetings'] },
      { label: 'CREATE', routeSegments: ['meeting', 'create'] },
      { label: 'LOGIN', routeSegments: ['login'] },
    ]);
    fixture.detectChanges();
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Architecture');
    const labels = Array.from(el.querySelectorAll('ui-link')).map((l) => l.textContent?.trim());
    expect(labels.slice(0, 3)).toEqual(['MEETINGS', 'CREATE', 'LOGIN']);
  });

  it('L2-021/2: clicking the h2 raises titleClick', () => {
    (el.querySelector('h2') as HTMLElement).click();
    expect(fixture.componentInstance.titleClicks).toBe(1);
  });

  it('L2-033/1: the title links to / without a page load', () => {
    const anchor = el.querySelector('h2 a') as HTMLAnchorElement;
    expect(anchor.getAttribute('href')).toBe('/');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('L2-033/2: a signed-out header shows a link to /login and no avatar', () => {
    expect(el.querySelector('.avatar')).toBeNull();
    expect(el.querySelector('ui-link a[href="/login"]')).not.toBeNull();
  });

  it('L2-033/2: a signed-in header shows an account avatar that opens the account menu', () => {
    fixture.componentInstance.signedIn.set(true);
    fixture.detectChanges();
    expect(el.querySelector('ui-link a[href="/login"]')).toBeNull();
    const avatar = el.querySelector('button.avatar') as HTMLButtonElement;
    expect(avatar.getAttribute('aria-haspopup')).toBe('menu');
    avatar.click();
    expect(fixture.componentInstance.accountClicks).toBe(1);
  });
});
