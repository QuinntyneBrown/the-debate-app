import { MeetingDto } from '@the-debate-app/api';

/** The event contract of the meeting components (L2-030). Each factory builds a bubbling `CustomEvent`. */
function meetingEvent<T>(type: string, detail: T): CustomEvent<T> {
  return new CustomEvent<T>(type, { detail, bubbles: true, composed: true });
}

export const MeetingEditSelect = (meetingId: number) => meetingEvent('[Meeting] Select', { meetingId, readonly: false });
export const MeetingViewSelect = (meetingId: number) => meetingEvent('[Meeting] Select', { meetingId, readonly: true });
export const MeetingDeleteSelect = (meetingId: number) => meetingEvent('[Meeting] Delete', { meetingId });
export const MeetingAddSuccess = (meeting: MeetingDto) => meetingEvent('[Meeting] Add Success', { meeting });
export const MeetingDeleteSuccess = (meetingId: number) => meetingEvent('[Meeting] Delete Success', { meetingId });
