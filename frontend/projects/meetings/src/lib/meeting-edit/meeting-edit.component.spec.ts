// Traces to: L2-024, L2-034, L2-030, L2-003, L2-004, L2-031
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MeetingDto, provideApi } from '@the-debate-app/api';
import { RichTextEditorComponent, RichTextEngine, ToastService } from '@the-debate-app/components';
import { MeetingEditComponent } from './meeting-edit.component';

/** Stands in for Quill so the specs can set and read editor HTML without a browser selection. */
class FakeEngine extends RichTextEngine {
  static instances: FakeEngine[] = [];
  html = '';
  private callback: (html: string) => void = () => undefined;
  private node!: HTMLElement;
  constructor() {
    super();
    FakeEngine.instances.push(this);
  }
  mount(host: HTMLElement): HTMLElement {
    this.node = document.createElement('div');
    host.appendChild(this.node);
    return this.node;
  }
  setHtml(html: string): void {
    this.html = html;
    this.node.innerHTML = html;
  }
  format(): void {}
  onChange(callback: (html: string) => void): void {
    this.callback = callback;
  }
  onFormatsChange(): void {}
  destroy(): void {}
  type(html: string): void {
    this.html = html;
    this.callback(html);
  }
}

const existing: MeetingDto = {
  id: 7,
  name: 'Universal basic income',
  date: '2026-10-13',
  start: '2026-10-13T19:00:00',
  end: '2026-10-13T20:30:00',
  abstract: '<p>Abstract text</p>',
  agenda: '<p>Agenda text</p>',
  minutes: '<p>Minutes text</p>',
};

describe('MeetingEditComponent', () => {
  let fixture: ComponentFixture<MeetingEditComponent>;
  let el: HTMLElement;
  let http: HttpTestingController;
  let router: Router;
  let toasts: ToastService;

  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const input = (id: string) => el.querySelector<HTMLInputElement>(`#${id}`)!;
  const type = async (id: string, value: string) => {
    const field = input(id);
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  };
  const button = (text: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === text)!;
  const dialogButton = (text: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('.dialog button')).find((b) => b.textContent?.trim() === text)!;
  const submit = async () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle();
  };

  async function open(id?: string, response: MeetingDto | 'error' | 'pending' = existing): Promise<void> {
    fixture = TestBed.createComponent(MeetingEditComponent);
    el = fixture.nativeElement;
    document.body.appendChild(el);
    if (id !== undefined) fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    if (id !== undefined) {
      const req = http.expectOne(`/api/meeting/getById?id=${id}`);
      expect(req.request.method).toBe('GET');
      if (response === 'error') req.flush('x', { status: 404, statusText: 'Not Found' });
      else if (response !== 'pending') req.flush(response);
    }
    await settle();
  }

  beforeEach(() => {
    localStorage.clear();
    FakeEngine.instances = [];
    TestBed.configureTestingModule({
      providers: [provideApi(), provideHttpClientTesting(), provideRouter([])],
    });
    TestBed.overrideComponent(RichTextEditorComponent, {
      set: { providers: [{ provide: RichTextEngine, useClass: FakeEngine }] },
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    toasts = TestBed.inject(ToastService);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    el?.remove();
    http.verify();
    vi.restoreAllMocks();
  });

  describe('create (L2-024 criteria 1, 3 and 4; L2-031 criterion 3)', () => {
    beforeEach(() => open());

    it('shows the heading Create Meeting, empty fields, native date and time inputs and no GET', () => {
      expect(el.querySelector('h1')?.textContent).toBe('Create Meeting');
      expect(['name', 'date', 'start', 'end'].map((f) => input(f).value)).toEqual(['', '', '', '']);
      expect(input('date').type).toBe('date');
      expect(input('start').type).toBe('time');
      expect(input('end').type).toBe('time');
      expect(button('Create meeting')).toBeTruthy();
      expect(el.querySelector('.danger-zone')).toBeNull();
    });

    it('renders Abstract, Agenda and Minutes as rich-text editors in a tab strip, Abstract first', () => {
      expect(el.querySelectorAll('.editor__toolbar').length).toBe(3);
      const tabs = Array.from(el.querySelectorAll('[role="tab"]'));
      expect(tabs.map((t) => t.textContent?.trim())).toEqual(['Abstract', 'Agenda', 'Minutes']);
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    });

    describe('validation (L2-034 criteria 1 and 2)', () => {
      it('an empty name sends nothing and shows the invalid state', async () => {
        await submit();
        http.expectNone('/api/meeting/add');
        expect(el.querySelector('.form-summary .alert__title')?.textContent).toBe('Fix 1 thing to create the meeting');
        expect(el.querySelector('#name-error')?.textContent).toBe('Enter a name.');
        expect(input('name').getAttribute('aria-invalid')).toBe('true');
        expect(el.querySelector('.form-summary a[href="#name"]')?.textContent).toBe('Enter a name');
        expect(document.activeElement).toBe(el.querySelector('#summary'));
      });

      it('End not after Start sends nothing and shows the invalid state', async () => {
        await type('name', 'Debate');
        await type('start', '20:30');
        await type('end', '19:00');
        await submit();
        http.expectNone('/api/meeting/add');
        expect(el.querySelector('#end-error')?.textContent).toBe('End must be after start.');
        expect(el.querySelector('.form-summary a[href="#end"]')?.textContent).toBe('End must be after start');
        await type('end', '20:30');
        await submit();
        http.expectNone('/api/meeting/add');
        expect(el.querySelector('#end-error')).not.toBeNull();
      });

      it('lists both problems and clears each once it is fixed', async () => {
        await type('start', '20:30');
        await type('end', '19:00');
        await submit();
        expect(el.querySelector('.form-summary .alert__title')?.textContent).toBe('Fix 2 things to create the meeting');
        await type('name', 'Debate');
        expect(el.querySelector('.form-summary .alert__title')?.textContent).toBe('Fix 1 thing to create the meeting');
        await type('end', '21:00');
        expect(el.querySelector('.form-summary')).toBeNull();
      });
    });

    describe('save (L2-024 criterion 6, L2-030 criterion 4)', () => {
      const fill = async () => {
        await type('name', 'Should cities ban cars?');
        await type('date', '2026-10-20');
        await type('start', '19:00');
        await type('end', '20:30');
        FakeEngine.instances[0].type('<p>abs</p>');
        FakeEngine.instances[1].type('<p>age</p>');
        FakeEngine.instances[2].type('<p>min</p>');
        await settle();
      };

      it('POSTs api/meeting/add without an id, shows the submitting state, then toasts, dispatches and navigates', async () => {
        const seen: unknown[] = [];
        document.body.addEventListener('[Meeting] Add Success', (e) => seen.push((e as CustomEvent).detail));
        await fill();
        await submit();
        const req = http.expectOne('/api/meeting/add');
        expect(req.request.method).toBe('POST');
        expect(JSON.parse(req.request.body)).toEqual({
          date: '2026-10-20',
          start: '19:00',
          end: '20:30',
          name: 'Should cities ban cars?',
          abstract: '<p>abs</p>',
          agenda: '<p>age</p>',
          minutes: '<p>min</p>',
        });
        expect('id' in JSON.parse(req.request.body)).toBe(false);
        expect(button('Creating…').getAttribute('aria-busy')).toBe('true');
        expect(input('name').readOnly).toBe(true);
        expect(el.querySelectorAll('.editor--busy').length).toBe(3);
        const saved = { ...existing, id: 12, name: 'Should cities ban cars?' };
        req.flush(saved);
        await settle();
        expect(router.navigateByUrl).toHaveBeenCalledWith('/meetings');
        expect(toasts.toasts().at(-1)).toMatchObject({ tone: 'success', title: 'Meeting saved', text: 'Should cities ban cars?' });
        expect(seen).toEqual([{ meeting: saved }]);
      });

      it('a second submit while saving sends nothing', async () => {
        await fill();
        await submit();
        await submit();
        http.expectOne('/api/meeting/add');
      });

      it('failure keeps the form, shows the inline alert and the button retries the same request', async () => {
        await fill();
        await submit();
        http.expectOne('/api/meeting/add').flush('x', { status: 500, statusText: 'Server Error' });
        await settle();
        expect(el.querySelector('.alert--danger .alert__title')?.textContent).toBe("We couldn't create the meeting");
        expect(el.querySelector('.alert--danger')?.textContent).toContain('Everything you typed is still here.');
        expect(input('name').value).toBe('Should cities ban cars?');
        expect(router.navigateByUrl).not.toHaveBeenCalled();
        await submit();
        http.expectOne('/api/meeting/add').flush({ ...existing, id: 13 });
        await settle();
        expect(router.navigateByUrl).toHaveBeenCalledWith('/meetings');
      });
    });
  });

  describe('edit (L2-024 criterion 2; L2-031 criterion 2)', () => {
    it('shows Edit Meeting and, while loading, a skeleton with Save disabled', async () => {
      await open('7', 'pending');
      expect(el.querySelector('h1')?.textContent).toBe('Edit Meeting');
      expect(el.querySelector('[aria-busy="true"][aria-label="Loading meeting"]')).not.toBeNull();
      expect(button('Save').disabled).toBe(true);
    });

    it('calls getById and populates name, date, start, end and the three editors', async () => {
      await open('7');
      expect(input('name').value).toBe('Universal basic income');
      expect(input('date').value).toBe('2026-10-13');
      expect(input('start').value).toBe('19:00');
      expect(input('end').value).toBe('20:30');
      expect(FakeEngine.instances.map((e) => e.html)).toEqual(['<p>Abstract text</p>', '<p>Agenda text</p>', '<p>Minutes text</p>']);
      expect(el.querySelector('.danger-zone h2')?.textContent).toBe('Delete this meeting');
      expect(button('Save')).toBeTruthy();
    });

    it('error: a meeting that cannot be loaded shows the error state, Try again reloads', async () => {
      await open('7', 'error');
      expect(el.querySelector('.empty--error h1')?.textContent).toBe("We couldn't open this meeting");
      expect(el.querySelector('.empty a.btn')?.getAttribute('href')).toBe('/meetings');
      button('Try again').click();
      http.expectOne('/api/meeting/getById?id=7').flush(existing);
      await settle();
      expect(input('name').value).toBe('Universal basic income');
    });

    it('edge: a meeting without a date leaves the date input empty', async () => {
      await open('7', { ...existing, date: '' });
      expect(input('date').value).toBe('');
    });

    it('Save sends the id with the edited values; failure raises a danger toast that retries', async () => {
      await open('7');
      await type('name', 'Renamed');
      await submit();
      const req = http.expectOne('/api/meeting/add');
      expect(req.request.method).toBe('POST');
      expect(JSON.parse(req.request.body)).toMatchObject({ id: 7, name: 'Renamed', date: '2026-10-13', start: '19:00', end: '20:30' });
      expect(button('Saving…').getAttribute('aria-busy')).toBe('true');
      req.flush('x', { status: 500, statusText: 'Server Error' });
      await settle();
      const toast = toasts.toasts().at(-1)!;
      expect(toast).toMatchObject({ tone: 'danger', title: "We couldn't save the meeting", actionLabel: 'Try again' });
      expect(input('name').value).toBe('Renamed');
      toast.action!();
      http.expectOne('/api/meeting/add').flush({ ...existing, name: 'Renamed' });
      await settle();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/meetings');
    });
  });

  describe('delete from the form (L2-024 criterion 7, L2-030 criteria 3 and 5)', () => {
    beforeEach(() => open('7'));

    it('confirms in a dialog, sends DELETE, toasts, dispatches Delete Success and navigates without the discard prompt', async () => {
      const seen: unknown[] = [];
      document.body.addEventListener('[Meeting] Delete Success', (e) => seen.push((e as CustomEvent).detail));
      await type('name', 'Edited so the form is dirty');
      button('Delete meeting').click();
      await settle();
      expect(el.querySelector('.dialog__title')?.textContent).toBe('Delete “Universal basic income”?');
      dialogButton('Delete meeting').click();
      await settle();
      const req = http.expectOne('/api/meeting/remove?id=7');
      expect(req.request.method).toBe('DELETE');
      req.flush(7);
      await settle();
      expect(toasts.toasts().at(-1)).toMatchObject({ tone: 'success', title: 'Meeting deleted' });
      expect(seen).toEqual([{ meetingId: 7 }]);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/meetings');
      await expect(fixture.componentInstance.canLeave()).resolves.toBe(true);
    });

    it('a failed delete leaves the dialog open in its failed state', async () => {
      button('Delete meeting').click();
      await settle();
      dialogButton('Delete meeting').click();
      http.expectOne('/api/meeting/remove?id=7').flush('x', { status: 500, statusText: 'Server Error' });
      await settle();
      expect(el.querySelector('.dialog .alert--danger')?.textContent).toContain("We couldn't delete it");
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      dialogButton('Cancel').click();
      await settle();
      expect(el.querySelector('[role="dialog"]')).toBeNull();
    });
  });

  describe('leaving with unsaved changes (L2-034 criterion 3)', () => {
    beforeEach(() => open('7'));

    it('allows leaving a pristine form without a dialog', async () => {
      await expect(fixture.componentInstance.canLeave()).resolves.toBe(true);
      expect(el.querySelector('[role="dialog"]')).toBeNull();
    });

    it('asks first when a field changed; Keep editing stays and Discard leaves', async () => {
      await type('name', 'Changed');
      const keep = fixture.componentInstance.canLeave();
      await settle();
      expect(el.querySelector('.dialog__title')?.textContent).toBe('Leave without saving?');
      expect(el.querySelector('#discard-desc')?.textContent).toContain('Your changes to “Changed” will be lost.');
      button('Keep editing').click();
      await expect(keep).resolves.toBe(false);
      await settle();
      expect(el.querySelector('[role="dialog"]')).toBeNull();

      const leave = fixture.componentInstance.canLeave();
      await settle();
      button('Discard').click();
      await expect(leave).resolves.toBe(true);
    });

    it('treats an edited editor as unsaved changes and reverting a field as clean', async () => {
      FakeEngine.instances[2].type('<p>New minutes</p>');
      await settle();
      const pending = fixture.componentInstance.canLeave();
      await settle();
      expect(el.querySelector('[role="dialog"]')).not.toBeNull();
      button('Keep editing').click();
      await pending;
      FakeEngine.instances[2].type('<p>Minutes text</p>');
      await type('name', 'x');
      await type('name', 'Universal basic income');
      await expect(fixture.componentInstance.canLeave()).resolves.toBe(true);
    });
  });
});
