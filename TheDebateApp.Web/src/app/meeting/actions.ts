import { Meeting } from "./meeting.model";

export var meetingActions = {
    ADD_SUCCESS: "[Meeting] Add Success",
    DELETE: "[Meeting] Delete",
    DELETE_SUCCESS: "[Meeting] Delete Success",
    SELECT: "[Meeting] Select"
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

export class MeetingDeleteSelect extends CustomEvent {
    constructor(id: number) {
        super(meetingActions.DELETE, {
            detail: {
                meetingId: id,
            }
        });
    }
}

export class MeetingEditSelect extends CustomEvent {
    constructor(id: number) {
        super(meetingActions.SELECT, {
            detail: {
                meetingId: id,
                readonly: false,
            }
        });
    }
}

export class MeetingViewSelect extends CustomEvent {
    constructor(id: number) {
        super(meetingActions.SELECT, {
            detail: {
                meetingId: id,
                readonly: true
            }
        });
    }
}