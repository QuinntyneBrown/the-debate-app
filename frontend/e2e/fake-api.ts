import { Page, Route } from '@playwright/test';

export interface Meeting {
  id: number;
  name: string;
  date: string;
  start: string;
  end: string;
  abstract: string;
  agenda: string;
  minutes: string;
}

/** `yyyy-MM-dd` for today plus the given number of days, in local time. */
export function isoDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function seedMeetings(): Meeting[] {
  return [
    {
      id: 1,
      name: 'Introduction',
      date: isoDay(-14),
      start: '19:00',
      end: '20:00',
      abstract: '<p>First meeting of the season.</p>',
      agenda: '<p>Introduction</p>',
      minutes: '<p>Fourteen members attended.</p>',
    },
    {
      id: 2,
      name: 'Should cities ban cars from downtown?',
      date: isoDay(7),
      start: '19:00',
      end: '20:30',
      abstract: '<p>This house would ban private cars from city centres.</p>',
      agenda: '',
      minutes: '',
    },
  ];
}

export interface FakeApi {
  meetings: Meeting[];
  /** Bodies received by `POST api/meeting/add`, parsed. */
  saved: Record<string, unknown>[];
  /** Ids received by `DELETE api/meeting/remove`. */
  removed: number[];
  /** Number of `GET api/meeting/get` calls. */
  listCalls: () => number;
}

/** Answers every `/api/*` call from memory; nothing leaves the browser. */
export async function mockApi(page: Page, initial: Meeting[] = seedMeetings()): Promise<FakeApi> {
  const state = { meetings: initial.map((m) => ({ ...m })), saved: [] as Record<string, unknown>[], removed: [] as number[] };
  let listCalls = 0;
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\//, '').toLowerCase();
    const id = Number(url.searchParams.get('id'));

    switch (`${request.method()} ${path}`) {
      case 'POST user/token': {
        const form = new URLSearchParams(request.postData() ?? '');
        if (form.get('username') === 'admin' && form.get('password') === 'admin') {
          return json(route, { access_token: 'e2e-token', token_type: 'bearer', expires_in: 3600 });
        }
        return json(route, { error: 'invalid_grant', error_description: 'Invalid credentials' }, 400);
      }
      case 'GET user/current':
        return json(route, { id: 1, name: 'admin' });
      case 'GET meeting/get':
        listCalls++;
        return json(route, state.meetings);
      case 'GET meeting/getbyid': {
        const found = state.meetings.find((m) => m.id === id);
        return found ? json(route, found) : json(route, null, 404);
      }
      case 'POST meeting/add': {
        const body = JSON.parse(request.postData() ?? '{}') as Partial<Meeting>;
        state.saved.push(body as Record<string, unknown>);
        const index = state.meetings.findIndex((m) => m.id === body.id);
        const next: Meeting = {
          id: body.id ?? Math.max(0, ...state.meetings.map((m) => m.id)) + 1,
          name: body.name ?? '',
          date: body.date ?? '',
          start: body.start ?? '',
          end: body.end ?? '',
          abstract: body.abstract ?? '',
          agenda: body.agenda ?? '',
          minutes: body.minutes ?? '',
        };
        if (index >= 0) state.meetings[index] = next;
        else state.meetings.push(next);
        return json(route, next);
      }
      case 'DELETE meeting/remove': {
        state.removed.push(id);
        state.meetings = state.meetings.filter((m) => m.id !== id);
        return json(route, id);
      }
      default:
        return json(route, { message: `Unmocked ${request.method()} ${path}` }, 500);
    }
  });

  return {
    get meetings() {
      return state.meetings;
    },
    saved: state.saved,
    removed: state.removed,
    listCalls: () => listCalls,
  };
}
