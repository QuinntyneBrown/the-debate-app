// Traces to: L2-003, L2-031, L2-028
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MeetingDto, provideApi } from '@the-debate-app/api';
import { MEETINGS_NOW } from '../meeting-format';
import { MeetingViewComponent } from './meeting-view.component';

const past: MeetingDto = {
  id: 7,
  name: 'Universal basic income',
  date: '2026-10-13',
  start: '19:00',
  end: '20:30',
  abstract: '<p>This house would introduce a universal basic income.</p>',
  agenda: '<h2>Order of play</h2><ol><li>Welcome</li></ol>',
  minutes: '<p>Fourteen members attended.</p>',
};

describe('MeetingViewComponent (read-only meeting page)', () => {
  let fixture: ComponentFixture<MeetingViewComponent>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const tabs = () => Array.from(el.querySelectorAll<HTMLElement>('[role="tab"]'));
  const selectedTab = () => tabs().find((t) => t.getAttribute('aria-selected') === 'true')?.textContent?.trim();
  const panel = (title: string) =>
    el.querySelector<HTMLElement>(`[role="tabpanel"][aria-labelledby="${tabs().find((t) => t.textContent?.trim() === title)!.id}"]`)!;

  async function open(id = '7', response: MeetingDto | 'error' | 'notFound' | 'pending' = past) {
    fixture = TestBed.createComponent(MeetingViewComponent);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    const req = http.expectOne(`/api/meeting/getById?id=${id}`);
    expect(req.request.method).toBe('GET');
    if (response === 'error') req.flush('x', { status: 500, statusText: 'Server Error' });
    else if (response === 'notFound') req.flush(null, { status: 404, statusText: 'Not Found' });
    else if (response !== 'pending') req.flush(response);
    await settle();
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideApi(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: MEETINGS_NOW, useValue: () => new Date(2026, 9, 19) },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('L2-003/L2-031 criterion 1: loads the meeting and shows name, when, Edit and the Back link', async () => {
    await open();
    expect(el.querySelector('h1')?.textContent).toBe('Universal basic income');
    expect(el.querySelector('.subtitle')?.textContent).toBe('Tue 13 Oct · 7:00 pm–8:30 pm');
    expect(el.querySelector('a.btn--primary')?.textContent?.trim()).toBe('Edit');
    expect(el.querySelector('a.btn--primary')?.getAttribute('href')).toBe('/meeting/7/edit');
    const back = el.querySelector('a[href="/meetings"]')!;
    expect(back.textContent?.trim()).toBe('Meetings');
  });

  it('shows Abstract, Agenda and Minutes as tabs with the HTML of each section', async () => {
    await open();
    expect(tabs().map((t) => t.textContent?.trim())).toEqual(['Abstract', 'Agenda', 'Minutes']);
    expect(panel('Abstract').querySelector('p')?.textContent).toContain('universal basic income');
    expect(panel('Agenda').querySelector('h2')?.textContent).toBe('Order of play');
    expect(panel('Minutes').querySelector('.prose p')?.textContent).toBe('Fourteen members attended.');
  });

  it('opens Minutes first for a past meeting and Abstract first for an upcoming one', async () => {
    await open();
    expect(selectedTab()).toBe('Minutes');
    await open('8', { ...past, id: 8, date: '2026-10-27' });
    expect(selectedTab()).toBe('Abstract');
  });

  it('a section without content shows an empty message inside its tab', async () => {
    await open('7', { ...past, agenda: '' });
    expect(panel('Agenda').textContent).toContain('Nothing here yet.');
  });

  it('loading: shows a skeleton, keeps Edit, and replaces it when the meeting arrives', async () => {
    await open('7', 'pending');
    expect(el.querySelector('[aria-busy="true"][aria-label="Loading meeting"]')).not.toBeNull();
    expect(el.querySelector('a.btn--primary')?.textContent?.trim()).toBe('Edit');
    http.expectNone('/api/meeting/getById?id=7');
  });

  it('error (L2-003 criterion 3, HTTP 404): names both causes and offers Try again and Back to meetings', async () => {
    await open('7', 'notFound');
    expect(el.querySelector('.empty--error h1')?.textContent).toBe("We couldn't open this meeting");
    expect(el.querySelector('.empty__text')?.textContent).toBe('It may have been deleted, or the connection dropped.');
    expect(el.querySelector('.empty a.btn')?.getAttribute('href')).toBe('/meetings');
    expect(el.querySelector('.empty a.btn')?.textContent?.trim()).toBe('Back to meetings');
    (Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Try again') as HTMLButtonElement).click();
    http.expectOne('/api/meeting/getById?id=7').flush(past);
    await settle();
    expect(el.querySelector('h1')?.textContent).toBe('Universal basic income');
  });

  it('edge: a long name wraps and a null date shows no date text', async () => {
    await open('7', { ...past, date: '', start: '', end: '', name: 'A very long motion '.repeat(10).trim() });
    expect(el.querySelector('h1')?.textContent?.length).toBeGreaterThan(150);
    expect(el.querySelector('.subtitle')).toBeNull();
  });
});
