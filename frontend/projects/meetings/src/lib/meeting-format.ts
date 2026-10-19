import { InjectionToken } from '@angular/core';
import { MeetingDto } from '@the-debate-app/api';

/** The clock of the meetings feature; tests and the e2e suite can supply a fixed date. */
export const MEETINGS_NOW = new InjectionToken<() => Date>('MEETINGS_NOW', {
  providedIn: 'root',
  factory: () => () => new Date(),
});

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses `yyyy-MM-dd` as a local date; an empty or malformed value is "no date". */
export function parseDate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `HH:mm` of a time or of a legacy date-time such as `2026-10-20T19:00:00`; empty when there is none. */
export function timeOf(value: string | null | undefined): string {
  const match = /(?:^|T)(\d{2}):(\d{2})/.exec(value ?? '');
  return match ? `${match[1]}:${match[2]}` : '';
}

/** `19:00` as `7:00 pm`. */
export function formatClock(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** `7:00 pm–8:30 pm`, just the start when there is no end, empty when there is no start. */
export function timeRange(start: string, end: string): string {
  const from = timeOf(start);
  const to = timeOf(end);
  if (!from) return '';
  return to ? `${formatClock(from)}–${formatClock(to)}` : formatClock(from);
}

/** `Tue 13 Oct`. */
export function plainDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function monthShort(date: Date): string {
  return MONTHS[date.getMonth()];
}

function dayDifference(date: Date, today: Date): number {
  const a = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a - b) / 86_400_000);
}

function dayWord(date: Date, today: Date): string {
  const diff = dayDifference(date, today);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return plainDate(date);
}

/** `Tomorrow · 7:00 pm–8:30 pm`, `Tue 27 Oct · …`, or `Date not set`. */
export function whenLabel(meeting: MeetingDto, today: Date): string {
  const date = parseDate(meeting.date);
  if (!date) return 'Date not set';
  const range = timeRange(meeting.start, meeting.end);
  return range ? `${dayWord(date, today)} · ${range}` : dayWord(date, today);
}

/** Today and later is upcoming, as is a meeting without a date. */
export function isUpcoming(meeting: MeetingDto, today: Date): boolean {
  const date = parseDate(meeting.date);
  return date === null || dayDifference(date, today) >= 0;
}

const byDateThenStart = (a: MeetingDto, b: MeetingDto) =>
  a.date.localeCompare(b.date) || timeOf(a.start).localeCompare(timeOf(b.start));

/** Upcoming oldest-first with undated meetings last; past newest-first. */
export function groupMeetings(meetings: MeetingDto[], today: Date): { upcoming: MeetingDto[]; past: MeetingDto[] } {
  const upcoming = meetings.filter((m) => isUpcoming(m, today));
  const dated = upcoming.filter((m) => parseDate(m.date)).sort(byDateThenStart);
  const undated = upcoming.filter((m) => !parseDate(m.date));
  const past = meetings.filter((m) => !isUpcoming(m, today)).sort((a, b) => byDateThenStart(b, a));
  return { upcoming: [...dated, ...undated], past };
}

/** The subtitle of the meetings page. */
export function listSummary(upcoming: MeetingDto[], today: Date): string {
  if (upcoming.length === 0) return 'No upcoming meetings';
  const undated = upcoming.filter((m) => !parseDate(m.date)).length;
  const count = `${upcoming.length} upcoming`;
  if (undated > 0) return `${count} · ${undated} without a date`;
  const next = upcoming[0];
  const date = parseDate(next.date)!;
  const word = dayWord(date, today);
  const day = word === 'Today' || word === 'Tomorrow' ? word.toLowerCase() : word;
  const start = timeOf(next.start);
  return `${count} · next is ${day}${start ? ` at ${formatClock(start)}` : ''}`;
}
