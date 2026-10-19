// Traces to: L2-023, L2-031, L2-030, L2-003
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MeetingDto, provideApi } from '@the-debate-app/api';
import { ToastService } from '@the-debate-app/components';
import { MEETINGS_NOW } from '../meeting-format';
import { MeetingListComponent } from './meeting-list.component';

const meeting = (over: Partial<MeetingDto>): MeetingDto => ({
  id: 1,
  name: 'Meeting',
  date: '2026-10-20',
  start: '19:00',
  end: '20:30',
  abstract: '<p>An abstract.</p>',
  agenda: '',
  minutes: '',
  ...over,
});

const MEETINGS: MeetingDto[] = [
  meeting({ id: 1, name: 'Should cities ban cars from downtown?', date: '2026-10-20' }),
  meeting({ id: 2, name: 'AI in classrooms', date: '2026-10-27' }),
  meeting({ id: 3, name: 'Universal basic income', date: '2026-10-13' }),
];

describe('MeetingListComponent', () => {
  let fixture: ComponentFixture<MeetingListComponent>;
  let el: HTMLElement;
  let http: HttpTestingController;
  let router: Router;
  let toasts: ToastService;
  const events: string[] = [];

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const items = () => Array.from(el.querySelectorAll('li[ui-meeting-item]'));
  const button = (text: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === text)!;

  async function create(flush: MeetingDto[] | 'error' | 'pending' = MEETINGS) {
    fixture = TestBed.createComponent(MeetingListComponent);
    el = fixture.nativeElement;
    document.body.appendChild(el);
    fixture.detectChanges();
    const req = http.expectOne('/api/meeting/get');
    if (flush === 'error') req.flush('boom', { status: 500, statusText: 'Server Error' });
    else if (flush !== 'pending') req.flush(flush);
    await settle();
    return req;
  }

  beforeEach(() => {
    localStorage.clear();
    events.length = 0;
    TestBed.configureTestingModule({
      providers: [
        provideApi(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: MEETINGS_NOW, useValue: () => new Date(2026, 9, 19) },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    toasts = TestBed.inject(ToastService);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    el?.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('L2-023 criterion 1: heading and one item per meeting', () => {
    beforeEach(() => create());

    it('shows the heading Meetings, the summary and a New meeting action', () => {
      expect(el.querySelector('h1')?.textContent).toBe('Meetings');
      expect(el.querySelector('.subtitle')?.textContent).toBe('2 upcoming · next is tomorrow at 7:00 pm');
      expect(el.querySelector('a.btn--primary')?.textContent?.trim()).toBe('New meeting');
      expect(el.querySelector('a.btn--primary')?.getAttribute('href')).toBe('/meeting/create');
    });

    it('renders one item per meeting, grouped into Upcoming and Past', () => {
      expect(items().length).toBe(3);
      const headings = Array.from(el.querySelectorAll('h2.overline')).map((h) => h.textContent);
      expect(headings).toEqual(['Upcoming', 'Past']);
      const upcoming = el.querySelector('section[aria-labelledby="upcoming-h"]')!;
      expect(upcoming.querySelectorAll('li').length).toBe(2);
      expect(el.querySelector('section[aria-labelledby="past-h"] li')?.classList.contains('meeting--past')).toBe(true);
    });
  });

  describe('states', () => {
    it('loading: nothing shifts for 300 ms, then skeleton rows appear while the header stays', async () => {
      vi.useFakeTimers();
      const pending = await create('pending');
      expect(el.querySelector('[aria-busy="true"]')).toBeNull();
      vi.advanceTimersByTime(300);
      fixture.detectChanges();
      expect(el.querySelector('[aria-label="Loading meetings"][aria-busy="true"]')).not.toBeNull();
      expect(el.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
      expect(el.querySelector('h1')?.textContent).toBe('Meetings');
      pending.flush(MEETINGS);
      await settle();
      expect(el.querySelector('[aria-busy="true"]')).toBeNull();
      expect(items().length).toBe(3);
    });

    it('empty: invites the first meeting', async () => {
      await create([]);
      expect(el.querySelector('.empty__title')?.textContent).toBe('No meetings yet');
      expect(el.querySelector('.empty__text')?.textContent).toBe('Create the first one and the club has a place to meet.');
      expect(el.querySelector('.empty a.btn--primary')?.textContent?.trim()).toBe('New meeting');
      expect(el.querySelector('.subtitle')).toBeNull();
    });

    it('error: names the failure, keeps New meeting and Try again repeats the request', async () => {
      await create('error');
      expect(el.querySelector('.empty--error .empty__title')?.textContent).toBe("We couldn't load the meetings");
      expect(el.querySelector('.empty__text')?.textContent).toBe('Check your connection and try again.');
      expect(el.querySelector('.page-header a.btn--primary')?.textContent?.trim()).toBe('New meeting');
      button('Try again').click();
      http.expectOne('/api/meeting/get').flush(MEETINGS);
      await settle();
      expect(items().length).toBe(3);
      expect(el.querySelector('.empty--error')).toBeNull();
    });

    it('long: many meetings render in one call, grouped, without paging', async () => {
      const many = Array.from({ length: 40 }, (_, i) =>
        meeting({ id: 100 + i, name: `Week ${i}`, date: `2026-09-${String((i % 28) + 1).padStart(2, '0')}` }),
      );
      await create(many);
      expect(items().length).toBe(40);
      expect(el.querySelectorAll('section').length).toBe(1);
    });

    it('edge: undated and abstract-less meetings keep the placeholders and sit last among upcoming', async () => {
      await create([
        meeting({ id: 9, name: 'No date', date: '', start: '', end: '', abstract: '' }),
        meeting({ id: 8, name: 'Dated', date: '2026-11-03' }),
      ]);
      const names = items().map((i) => i.querySelector('h2')?.textContent?.trim());
      expect(names).toEqual(['Dated', 'No date']);
      expect(el.querySelector('.subtitle')?.textContent).toBe('2 upcoming · 1 without a date');
      expect(items()[1].textContent).toContain('Date not set');
      expect(items()[1].textContent).toContain('No abstract yet');
    });
  });

  describe('L2-023 criterion 3 and L2-031 criterion 4: Edit and View navigate', () => {
    beforeEach(() => create());

    it('Edit opens /meeting/{id}/edit', () => {
      el.querySelector<HTMLElement>('a[aria-label="Edit AI in classrooms"]')!.click();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/meeting/2/edit');
    });

    it('View opens /meeting/{id}', () => {
      el.querySelector<HTMLElement>('a[aria-label="View AI in classrooms"]')!.click();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/meeting/2');
    });

    it('L2-030: dispatches [Meeting] Select with readonly false for Edit and true for View, bubbling', () => {
      const seen: unknown[] = [];
      document.body.addEventListener('[Meeting] Select', (e) => seen.push((e as CustomEvent).detail), { once: false });
      el.querySelector<HTMLElement>('a[aria-label="Edit AI in classrooms"]')!.click();
      el.querySelector<HTMLElement>('a[aria-label="View AI in classrooms"]')!.click();
      expect(seen).toEqual([
        { meetingId: 2, readonly: false },
        { meetingId: 2, readonly: true },
      ]);
    });
  });

  describe('L2-023 criterion 4: Delete removes the item without a reload', () => {
    beforeEach(() => create());

    const openDialog = () => {
      el.querySelector<HTMLElement>('button[aria-label="Delete AI in classrooms"]')!.click();
      fixture.detectChanges();
    };

    it('opens the confirmation dialog and dispatches [Meeting] Delete; Cancel changes nothing', async () => {
      const seen: unknown[] = [];
      document.body.addEventListener('[Meeting] Delete', (e) => seen.push((e as CustomEvent).detail));
      openDialog();
      expect(el.querySelector('.dialog__title')?.textContent).toBe('Delete “AI in classrooms”?');
      expect(seen).toEqual([{ meetingId: 2 }]);
      button('Cancel').click();
      fixture.detectChanges();
      expect(el.querySelector('[role="dialog"]')).toBeNull();
      expect(items().length).toBe(3);
    });

    it('sends DELETE api/meeting/remove?id={id}, shows busy, then removes the row, toasts and dispatches the success event', async () => {
      const seen: unknown[] = [];
      document.body.addEventListener('[Meeting] Delete Success', (e) => seen.push((e as CustomEvent).detail));
      openDialog();
      button('Delete meeting').click();
      fixture.detectChanges();
      expect(button('Deleting…').getAttribute('aria-busy')).toBe('true');
      const req = http.expectOne('/api/meeting/remove?id=2');
      expect(req.request.method).toBe('DELETE');
      req.flush(2);
      await settle();
      expect(el.querySelector('[role="dialog"]')).toBeNull();
      expect(items().length).toBe(2);
      expect(el.textContent).not.toContain('AI in classrooms');
      http.expectNone('/api/meeting/get');
      expect(toasts.toasts().at(-1)).toMatchObject({ tone: 'success', title: 'Meeting deleted' });
      expect(seen).toEqual([{ meetingId: 2 }]);
    });

    it('failure keeps the dialog open in its failed state and the list unchanged; Try again repeats it', async () => {
      openDialog();
      button('Delete meeting').click();
      http.expectOne('/api/meeting/remove?id=2').flush('x', { status: 500, statusText: 'Server Error' });
      await settle();
      expect(el.querySelector('.dialog .alert--danger')?.textContent).toContain("We couldn't delete it");
      expect(items().length).toBe(3);
      expect(toasts.toasts().length).toBe(0);
      button('Try again').click();
      http.expectOne('/api/meeting/remove?id=2').flush(2);
      await settle();
      expect(items().length).toBe(2);
    });
  });
});
