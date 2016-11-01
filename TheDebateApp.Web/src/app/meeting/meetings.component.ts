import { Meeting } from "./meeting.model";
import { MeetingService } from "./meeting.service";
import { resolve, appServices } from "../container";
import { createElement } from "../utilities";
import { meetingActions, MeetingEditSelect } from "./actions";

let template = require("./meetings.component.html");
let styles = require("./meetings.component.scss");

let customInnerHTML = `<style>${styles}</style> ${template}`;

export class MeetingsComponent extends HTMLElement {
    constructor(private _meetingService: MeetingService = null) {
        super();

        this._meetingService = _meetingService || new MeetingService();
    }
    
    connectedCallback() { 
        this._meetingService.get().then((results: string) => {
            var resultsJSON: Array<Meeting> = JSON.parse(results) as Array<Meeting>;
            for (var i = 0; i < resultsJSON.length; i++) {
                this.appendChild(createElement(`<ce-meeting-item meeting='${JSON.stringify(resultsJSON[i])}'></ce-meeting-item>`));
                this.children[this.children.length - 1].addEventListener(meetingActions.SELECT, this.onMeetingSelect.bind(this));
                this.children[this.children.length - 1].addEventListener(meetingActions.DELETE, this.onMeetingDeleteSelect.bind(this));
            }
        });
    }

    public onMeetingSelect(event: MeetingEditSelect) {
        this.dispatchEvent(new MeetingEditSelect(event.detail.meetingId));
    }

    public onMeetingDeleteSelect(event: MeetingEditSelect) {
        this._meetingService.remove({ id: event.detail.meetingId }).then((results) => {
            event.target.removeEventListener(meetingActions.SELECT, this.onMeetingSelect.bind(this));
            event.target.removeEventListener(meetingActions.DELETE, this.onMeetingDeleteSelect.bind(this));
            this.removeChild(event.target as any);            
        });
    }
    
}



document.addEventListener("DOMContentLoaded",() => window.customElements.define("ce-meetings",MeetingsComponent));
