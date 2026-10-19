// Traces to: L2-020
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LinkComponent } from './link.component';

@Component({ template: '' })
class BlankPage {}

@Component({
  imports: [LinkComponent],
  template: `
    <ui-link id="a" [routeSegments]="['meetings']">Meetings</ui-link>
    <ui-link id="b" [routeSegments]="['meeting', 'create']">Create</ui-link>
  `,
})
class Host {}

describe('LinkComponent (L2-020)', () => {
  let fixture: ComponentFixture<Host>;
  let router: Router;

  const link = (id: string): HTMLElement => fixture.nativeElement.querySelector('#' + id);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideRouter([
          { path: 'meetings', component: BlankPage },
          { path: 'meeting/create', component: BlankPage },
          { path: '', component: BlankPage },
        ]),
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('criterion 1: clicking a link with ["meetings"] navigates to /meetings', async () => {
    link('a').click();
    await fixture.whenStable();
    expect(router.url).toBe('/meetings');
  });

  it('criterion 2: clicking a link with ["meeting","create"] navigates to /meeting/create', async () => {
    link('b').click();
    await fixture.whenStable();
    expect(router.url).toBe('/meeting/create');
  });

  it('criterion 3: the link renders with cursor pointer', () => {
    expect(getComputedStyle(link('a')).cursor).toBe('pointer');
  });

  it('criterion 4: the link has class active only while the route path equals its path', async () => {
    await router.navigateByUrl('/meetings');
    fixture.detectChanges();
    expect(link('a').classList.contains('active')).toBe(true);
    expect(link('a').querySelector('a')?.getAttribute('aria-current')).toBe('page');
    expect(link('b').classList.contains('active')).toBe(false);

    await router.navigateByUrl('/meeting/create');
    fixture.detectChanges();
    expect(link('a').classList.contains('active')).toBe(false);
    expect(link('a').querySelector('a')?.hasAttribute('aria-current')).toBe(false);
    expect(link('b').classList.contains('active')).toBe(true);
  });
});
