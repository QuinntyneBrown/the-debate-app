import { badRequest, notFound } from '../shared/http-error.js';
import type { Meeting, MeetingRepository } from './meeting.repository.js';

export interface MeetingDto {
  id?: number | null;
  name?: string | null;
  date?: string | null;
  start?: string | null;
  end?: string | null;
  abstract?: string | null;
  agenda?: string | null;
  minutes?: string | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Parses a date string and returns it as yyyy-MM-dd; throws 400 when unparseable. */
export function parseDate(value: string): string {
  const isoDay = /^(\d{4}-\d{2}-\d{2})(?:$|[T\s])/.exec(value.trim());
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw badRequest(`Invalid date: ${value}`);
  if (isoDay) return isoDay[1]!;
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

const toDto = (m: Meeting) => ({
  id: m.id,
  name: m.name,
  date: m.meetingDate ?? '',
  start: m.start,
  end: m.end,
  abstract: m.abstract,
  agenda: m.agenda,
  minutes: m.minutes,
});

export class MeetingService {
  constructor(private readonly repo: MeetingRepository) {}

  async addOrUpdate(dto: MeetingDto) {
    const existing = await this.repo.findForUpdate(dto.id);
    const date = dto.date ? parseDate(dto.date) : (existing?.meetingDate ?? null);
    const fields = {
      name: dto.name ?? null,
      meetingDate: date,
      start: dto.start ?? null,
      end: dto.end ?? null,
      abstract: dto.abstract ?? null,
      agenda: dto.agenda ?? null,
      minutes: dto.minutes ?? null,
    };
    const saved = existing ? await this.repo.update(existing.id, fields) : await this.repo.insert(fields);
    return toDto(saved);
  }

  async getAll() {
    return (await this.repo.getAll()).map(toDto);
  }

  async getById(id: number) {
    const meeting = await this.repo.getById(id);
    if (!meeting) throw notFound('Meeting');
    return toDto(meeting);
  }

  async remove(id: number): Promise<number> {
    if (!(await this.repo.softDelete(id))) throw notFound('Meeting');
    return id;
  }
}
