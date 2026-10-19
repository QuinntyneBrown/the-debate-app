import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MeetingDto } from '../models/meeting.dto';
import { ApiClient } from './api-client';

/** `api/meeting/*` calls. */
@Injectable({ providedIn: 'root' })
export class MeetingsService {
  private readonly api = inject(ApiClient);

  get(): Observable<MeetingDto[]> {
    return this.api.request('GET', 'meeting/get');
  }

  getById(id: number): Observable<MeetingDto> {
    return this.api.request('GET', 'meeting/getById', { params: { id } });
  }

  add(meeting: MeetingDto): Observable<MeetingDto> {
    return this.api.request('POST', 'meeting/add', { data: meeting });
  }

  update(meeting: MeetingDto): Observable<MeetingDto> {
    return this.api.request('PUT', 'meeting/update', { data: meeting });
  }

  remove(id: number): Observable<number> {
    return this.api.request('DELETE', 'meeting/remove', { params: { id } });
  }
}
