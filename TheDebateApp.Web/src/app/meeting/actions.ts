import { Meeting } from "./meeting.model";


export var meetingActions = {
    ADD_SUCCESS: "[Meeting] Add Success",
    DELETE_SUCCESS: "[Meeting] Delete Success"
};

export class MeetingDeleteSuccess extends CustomEvent {
    constructor(meetingId: any) {
        super(meetingActions.DELETE_SUCCESS, {
            detail: {
                meetingId: meetingId
            }
        });
    }
}

export class MeetingAddSuccess extends CustomEvent {
    constructor(meeting: Meeting) {
        super(meetingActions.ADD_SUCCESS, {
            detail: {
                meeting: meeting
            }
        });
    }
}