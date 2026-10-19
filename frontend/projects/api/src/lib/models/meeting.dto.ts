/** Mirrors the `MeetingDto` of `api/meeting/*` (camelCase JSON). */
export interface MeetingDto {
  id: number;
  name: string;
  /** `yyyy-MM-dd`, or an empty string when the meeting has no date. */
  date: string;
  start: string;
  end: string;
  abstract: string;
  agenda: string;
  minutes: string;
}
