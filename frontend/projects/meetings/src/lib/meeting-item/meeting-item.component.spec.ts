// Traces to: L2-023, L2-031
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MeetingDto } from '@the-debate-app/api';
import { MeetingItemComponent } from './meeting-item.component';

const base: MeetingDto = {
  id: 7,
  name: 'Universal basic income',
  date: '2026-10-13',
  start: '19:00',
  end: '20:30',
  abstract: '<p>This house would <strong>introduce</strong> a UBI.</p>',
  agenda: '',
  minutes: '',
};

@Component({
  imports: [MeetingItemComponent],
  template: `<ul>
    <li ui-meeting-item [meeting]="meeting()" [today]="today" [past]="past()" (edit)="log.push('edit' + $event)" (view)="log.push('view' + $event)" (delete)="log.push('delete' + $event)"></li>
  </ul>`,
})
class Host {
  meeting = signal<MeetingDto>(base);
  past = signal(true);
  today = new Date(2026, 9, 19);
  log: string[] = [];
}

describe('MeetingItemComponent (L2-023 criterion 2)', () => {
  let el: HTMLElement;
  let host: Host;
  let fixture: ReturnType<typeof TestBed.createComponent<Host>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('shows the name in an h2 and the abstract as HTML in a p', () => {
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Universal basic income');
    const p = el.querySelector('p')!;
    expect(p.querySelector('strong')?.textContent).toBe('introduce');
  });

  it('shows the date block and the time range, and marks a past meeting', () => {
    expect(el.querySelector('.meeting__day')?.textContent).toBe('13');
    expect(el.querySelector('.meeting__month')?.textContent).toBe('Oct');
    expect(el.querySelector('.meeting__when')?.textContent).toBe('Tue 13 Oct · 7:00 pm–8:30 pm');
    expect(el.querySelector('li')?.classList.contains('meeting--past')).toBe(true);
  });

  it('has Edit, View and Delete controls pointing at the L2-031 paths', () => {
    const edit = el.querySelector<HTMLAnchorElement>('a[aria-label="Edit Universal basic income"]')!;
    const view = el.querySelector<HTMLAnchorElement>('a[aria-label="View Universal basic income"]')!;
    const del = el.querySelector<HTMLElement>('[aria-label="Delete Universal basic income"]')!;
    expect(edit.getAttribute('href')).toBe('/meeting/7/edit');
    expect(view.getAttribute('href')).toBe('/meeting/7');
    expect(del).not.toBeNull();
  });

  it('raises edit, view and delete with the meeting id and cancels the anchor navigation', () => {
    const click = (selector: string) => {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      el.querySelector(selector)!.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(click('a[aria-label^="Edit"]')).toBe(true);
    expect(click('a[aria-label^="View"]')).toBe(true);
    click('[aria-label^="Delete"]');
    expect(host.log).toEqual(['edit7', 'view7', 'delete7']);
  });

  it('edge: a meeting without a date or abstract shows the placeholders', () => {
    host.meeting.set({ ...base, date: '', start: '', end: '', abstract: '' });
    host.past.set(false);
    fixture.detectChanges();
    expect(el.querySelector('.meeting__day')?.textContent).toBe('—');
    expect(el.querySelector('.meeting__month')?.textContent).toBe('tbc');
    expect(el.querySelector('.meeting__when')?.textContent).toBe('Date not set');
    expect(el.querySelector('.meeting__excerpt')?.textContent).toBe('No abstract yet');
    expect(el.querySelector('.meeting__excerpt')?.classList.contains('text-muted')).toBe(true);
    expect(el.querySelector('li')?.classList.contains('meeting--past')).toBe(false);
  });
});
