import type { Db } from '../shared/db.js';
import { SoftDeletableRepository } from '../shared/soft-deletable-repository.js';

export interface Meeting {
  id: number;
  name: string | null;
  meetingDate: string | null;
  start: string | null;
  end: string | null;
  abstract: string | null;
  agenda: string | null;
  minutes: string | null;
}

const COLUMNS =
  'id, name, meeting_date AS "meetingDate", start_time AS start, end_time AS "end", abstract, agenda, minutes';

export class MeetingRepository extends SoftDeletableRepository<Meeting> {
  constructor(db: Db) {
    super(db, 'meetings', COLUMNS);
  }

  async insert(m: Omit<Meeting, 'id'>): Promise<Meeting> {
    const r = await this.db.query(
      `INSERT INTO meetings (name, meeting_date, start_time, end_time, abstract, agenda, minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${COLUMNS}`,
      [m.name, m.meetingDate, m.start, m.end, m.abstract, m.agenda, m.minutes],
    );
    return r.rows[0];
  }

  async update(id: number, m: Omit<Meeting, 'id'>): Promise<Meeting> {
    const r = await this.db.query(
      `UPDATE meetings SET name = $2, meeting_date = $3, start_time = $4, end_time = $5,
         abstract = $6, agenda = $7, minutes = $8
       WHERE id = $1 AND is_deleted = false RETURNING ${COLUMNS}`,
      [id, m.name, m.meetingDate, m.start, m.end, m.abstract, m.agenda, m.minutes],
    );
    return r.rows[0];
  }
}
