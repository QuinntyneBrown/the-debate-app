// Traces to: L2-022, L2-019
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { HOME_ROUTES } from '../home.routes';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let harness: RouterTestingHarness;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([...HOME_ROUTES, { path: 'meetings', children: [] }])],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', HomePageComponent);
    el = harness.routeNativeElement as HTMLElement;
  });

  it('L2-019/1: the root path renders the home page', () => {
    expect(harness.routeNativeElement?.querySelector('h1')).not.toBeNull();
  });

  it('L2-022/1: shows the logo mark, the app name and the tagline', () => {
    expect(el.querySelector('.logo-mark svg')).not.toBeNull();
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('The Debate App');
    expect(el.querySelector('p.text-muted')?.textContent?.trim()).toBe('Meetings, agendas and minutes for the club.');
  });

  it('L2-022/1: offers an Enter link to /meetings styled as the primary large button', () => {
    const enter = el.querySelector<HTMLAnchorElement>('a.btn.btn--primary.btn--lg')!;
    expect(enter.textContent?.trim()).toBe('Enter');
    expect(enter.getAttribute('href')).toBe('/meetings');
  });

  it('L2-022/1: choosing Enter navigates to /meetings', async () => {
    el.querySelector<HTMLAnchorElement>('a.btn')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/meetings');
  });

  it('is laid out as the auth-layout page of the mock', () => {
    expect(el.querySelector('main#main.auth-layout .auth-card')).not.toBeNull();
  });
});
