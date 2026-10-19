// Traces to: L2-019, L2-031, L2-034
import { Component } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlSegment, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideApi } from '@the-debate-app/api';
import { MeetingEditComponent } from './meeting-edit/meeting-edit.component';
import { MeetingListComponent } from './meeting-list/meeting-list.component';
import { MeetingViewComponent } from './meeting-view/meeting-view.component';
import { MEETINGS_ROUTES, numericIdMatcher } from './meetings.routes';

@Component({ template: 'not found' })
class NotFoundStub {}

const segments = (...parts: string[]) => parts.map((p) => new UrlSegment(p, {}));

describe('numericIdMatcher (L2-019 criterion 7)', () => {
  const matcher = numericIdMatcher('meeting', 'edit');

  it('matches a numeric id and exposes it as the id parameter', () => {
    const result = matcher(segments('meeting', '12', 'edit'), null as never, null as never);
    expect(result?.consumed.length).toBe(3);
    expect(result?.posParams?.['id'].path).toBe('12');
  });

  it('does not match a non-numeric id, a signed id, or a different shape', () => {
    for (const parts of [
      ['meeting', 'abc', 'edit'],
      ['meeting', '-1', 'edit'],
      ['meeting', '1.5', 'edit'],
      ['meeting', '12'],
      ['meeting', '12', 'updateminutes'],
      ['meeting', '12', 'edit', 'extra'],
      ['other', '12', 'edit'],
    ]) {
      expect(matcher(segments(...parts), null as never, null as never)).toBeNull();
    }
  });
});

describe('MEETINGS_ROUTES', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideApi(),
        provideHttpClientTesting(),
        provideRouter(
          [
            { path: '', children: MEETINGS_ROUTES },
            { path: '**', component: NotFoundStub },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  it('L2-019 criterion 3: /meetings renders the meeting list', async () => {
    await harness.navigateByUrl('/meetings', MeetingListComponent);
  });

  it('L2-019 criterion 4 and L2-031 criterion 3: /meeting/create renders the empty form with no id', async () => {
    const page = await harness.navigateByUrl('/meeting/create', MeetingEditComponent);
    expect(page.id()).toBeUndefined();
  });

  it('L2-019 criterion 5 and L2-031 criterion 1: /meeting/{n} renders the read-only view for that meeting', async () => {
    const page = await harness.navigateByUrl('/meeting/12', MeetingViewComponent);
    expect(page.id()).toBe('12');
  });

  it('L2-031 criterion 2: /meeting/{n}/edit renders the edit form for that meeting', async () => {
    const page = await harness.navigateByUrl('/meeting/12/edit', MeetingEditComponent);
    expect(page.id()).toBe('12');
  });

  it('L2-019 criterion 7 and L2-031 criterion 5: a non-numeric id falls through to the not-found route', async () => {
    await harness.navigateByUrl('/meeting/abc', NotFoundStub);
    await harness.navigateByUrl('/meeting/abc/edit', NotFoundStub);
  });

  it('L2-019 criterion 6: /meeting/{n}/updateminutes renders no meeting view and does not throw', async () => {
    const page = await harness.navigateByUrl('/meeting/5/updateminutes', NotFoundStub);
    expect(page).toBeInstanceOf(NotFoundStub);
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('not found');
  });

  it('L2-034 criterion 3: leaving a dirty edit form asks before navigating away', async () => {
    const page = await harness.navigateByUrl('/meeting/create', MeetingEditComponent);
    const element = harness.routeNativeElement as HTMLElement;
    const name = element.querySelector<HTMLInputElement>('#name')!;
    name.value = 'Typed';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    harness.detectChanges();

    const navigation = harness.navigateByUrl('/meetings');
    for (let i = 0; i < 50 && !element.querySelector('.dialog__title'); i++) {
      await new Promise((resolve) => setTimeout(resolve));
      harness.detectChanges();
    }
    expect(element.querySelector('.dialog__title')?.textContent).toBe('Leave without saving?');
    Array.from(element.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Keep editing')!.click();
    await navigation;
    expect(TestBed.inject(Router).url).toBe('/meeting/create');
    expect(page).toBeTruthy();
  });
});
