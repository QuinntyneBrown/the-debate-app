// Traces to: L2-030
import {
  MeetingAddSuccess,
  MeetingDeleteSelect,
  MeetingDeleteSuccess,
  MeetingEditSelect,
  MeetingViewSelect,
} from './meeting-events';

describe('meeting events (L2-030)', () => {
  it('criterion 1: MeetingEditSelect', () => {
    const e = MeetingEditSelect(4);
    expect(e.type).toBe('[Meeting] Select');
    expect(e.detail).toEqual({ meetingId: 4, readonly: false });
    expect(e.bubbles).toBe(true);
  });

  it('criterion 2: MeetingViewSelect', () => {
    const e = MeetingViewSelect(4);
    expect(e.type).toBe('[Meeting] Select');
    expect(e.detail).toEqual({ meetingId: 4, readonly: true });
  });

  it('criterion 3: MeetingDeleteSelect', () => {
    const e = MeetingDeleteSelect(4);
    expect(e.type).toBe('[Meeting] Delete');
    expect(e.detail).toEqual({ meetingId: 4 });
  });

  it('criterion 4: MeetingAddSuccess', () => {
    const meeting = { id: 4, name: 'n', date: '', start: '', end: '', abstract: '', agenda: '', minutes: '' };
    const e = MeetingAddSuccess(meeting);
    expect(e.type).toBe('[Meeting] Add Success');
    expect(e.detail).toEqual({ meeting });
  });

  it('criterion 5: MeetingDeleteSuccess', () => {
    const e = MeetingDeleteSuccess(4);
    expect(e.type).toBe('[Meeting] Delete Success');
    expect(e.detail).toEqual({ meetingId: 4 });
  });
});
