// Traces to: L2-023, L2-024, L2-002
import { MeetingDto } from '@the-debate-app/api';
import {
  formatClock,
  groupMeetings,
  listSummary,
  parseDate,
  timeOf,
  timeRange,
  whenLabel,
} from './meeting-format';

const today = new Date(2026, 9, 19); // Monday 19 Oct 2026

const meeting = (over: Partial<MeetingDto>): MeetingDto => ({
  id: 1,
  name: 'm',
  date: '',
  start: '',
  end: '',
  abstract: '',
  agenda: '',
  minutes: '',
  ...over,
});

describe('meeting-format', () => {
  it('L2-002: parses yyyy-MM-dd as a local date and an empty string as no date', () => {
    expect(parseDate('2026-10-20')?.getDate()).toBe(20);
    expect(parseDate('')).toBeNull();
    expect(parseDate('nonsense')).toBeNull();
  });

  it('L2-024/2: extracts HH:mm from a time or a legacy date-time', () => {
    expect(timeOf('19:00')).toBe('19:00');
    expect(timeOf('2026-10-20T19:05:00')).toBe('19:05');
    expect(timeOf('')).toBe('');
    expect(timeOf(undefined as unknown as string)).toBe('');
  });

  it('formats clock times and ranges the way the mocks do', () => {
    expect(formatClock('19:00')).toBe('7:00 pm');
    expect(formatClock('00:05')).toBe('12:05 am');
    expect(formatClock('12:00')).toBe('12:00 pm');
    expect(timeRange('19:00', '20:30')).toBe('7:00 pm–8:30 pm');
    expect(timeRange('19:00', '')).toBe('7:00 pm');
    expect(timeRange('', '')).toBe('');
  });

  it('L2-023: labels when a meeting happens', () => {
    expect(whenLabel(meeting({ date: '2026-10-20', start: '19:00', end: '20:30' }), today)).toBe('Tomorrow · 7:00 pm–8:30 pm');
    expect(whenLabel(meeting({ date: '2026-10-19', start: '19:00' }), today)).toBe('Today · 7:00 pm');
    expect(whenLabel(meeting({ date: '2026-10-27', start: '19:00', end: '20:30' }), today)).toBe('Tue 27 Oct · 7:00 pm–8:30 pm');
    expect(whenLabel(meeting({ date: '2026-10-27' }), today)).toBe('Tue 27 Oct');
    expect(whenLabel(meeting({ date: '' }), today)).toBe('Date not set');
  });

  it('L2-023: groups into upcoming (today onwards, undated last) and past (newest first)', () => {
    const list = [
      meeting({ id: 1, date: '2026-10-13' }),
      meeting({ id: 2, date: '' }),
      meeting({ id: 3, date: '2026-10-27' }),
      meeting({ id: 4, date: '2026-10-19' }),
      meeting({ id: 5, date: '2026-09-29' }),
    ];
    const groups = groupMeetings(list, today);
    expect(groups.upcoming.map((m) => m.id)).toEqual([4, 3, 2]);
    expect(groups.past.map((m) => m.id)).toEqual([1, 5]);
  });

  it('L2-023: summarises the upcoming meetings', () => {
    const next = meeting({ date: '2026-10-20', start: '19:00' });
    const later = meeting({ date: '2026-10-27' });
    expect(listSummary([next, later], today)).toBe('2 upcoming · next is tomorrow at 7:00 pm');
    expect(listSummary([later], today)).toBe('1 upcoming · next is Tue 27 Oct');
    expect(listSummary([later, meeting({ date: '' })], today)).toBe('2 upcoming · 1 without a date');
    expect(listSummary([], today)).toBe('No upcoming meetings');
  });
});
