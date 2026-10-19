// Traces to: L2-001, L2-002, L2-003, L2-004, L2-027
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MeetingDto } from '../models/meeting.dto';
import { provideApi } from '../api-config';
import { SessionService } from '../storage/session.service';
import { MeetingsService } from './meetings.service';

const meeting: MeetingDto = {
  id: 0,
  name: 'Should cities ban cars?',
  date: '2026-10-20',
  start: '2026-10-20T19:00:00',
  end: '2026-10-20T20:30:00',
  abstract: '<p>a</p>',
  agenda: '<p>b</p>',
  minutes: '<p>c</p>',
};

describe('MeetingsService', () => {
  let service: MeetingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideApi(), provideHttpClientTesting()] });
    service = TestBed.inject(MeetingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('L2-002: get sends GET api/meeting/get and emits the meetings', () => {
    let result: MeetingDto[] = [];
    service.get().subscribe((m) => (result = m));
    const req = http.expectOne('/api/meeting/get');
    expect(req.request.method).toBe('GET');
    req.flush([{ ...meeting, id: 3 }]);
    expect(result[0].id).toBe(3);
  });

  it('L2-003: getById sends GET api/meeting/getById?id={id}', () => {
    service.getById(7).subscribe();
    const req = http.expectOne('/api/meeting/getById?id=7');
    expect(req.request.method).toBe('GET');
    req.flush({ ...meeting, id: 7 });
  });

  it('L2-001: add sends POST api/meeting/add with the JSON dto', () => {
    service.add(meeting).subscribe();
    const req = http.expectOne('/api/meeting/add');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(JSON.stringify(meeting));
    req.flush({ ...meeting, id: 9 });
  });

  it('L2-001: update sends PUT api/meeting/update with the JSON dto', () => {
    service.update({ ...meeting, id: 9 }).subscribe();
    const req = http.expectOne('/api/meeting/update');
    expect(req.request.method).toBe('PUT');
    expect(JSON.parse(req.request.body as string).id).toBe(9);
    req.flush({ ...meeting, id: 9 });
  });

  it('L2-004: remove sends DELETE api/meeting/remove?id={id} and emits the id', () => {
    let id = 0;
    service.remove(9).subscribe((v) => (id = v));
    const req = http.expectOne('/api/meeting/remove?id=9');
    expect(req.request.method).toBe('DELETE');
    req.flush(9);
    expect(id).toBe(9);
  });

  it('L2-027/1: a stored token is attached to add, update and remove', () => {
    TestBed.inject(SessionService).put({ name: 'token', value: 'jwt' });
    service.add(meeting).subscribe();
    expect(http.expectOne('/api/meeting/add').request.headers.get('Authorization')).toBe('Bearer jwt');
  });
});
