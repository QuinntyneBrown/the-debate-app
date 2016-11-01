import { Meeting } from "./meeting.model";
import { MeetingService } from "./meeting.service";
import { EditorComponent } from "../shared";
import { MeetingAddSuccess, MeetingDeleteSuccess } from "./actions";

var pikaday = require('pikaday');
var moment = require('moment');
declare var rome: any;

let template = require("./meeting-edit-page.component.html");
let styles = require("./meeting-edit-page.component.scss");

export class MeetingEditPageComponent extends HTMLElement {
    constructor(private _meeting: MeetingService = null) {
        super();

        this._meeting = _meeting || new MeetingService();
    }

    static get observedAttributes() {
        return ["meeting-id"];
    }
    
    connectedCallback() {        
        this.innerHTML = `<style>${styles}</style> ${template}`; 
        this.abstractEditor = new EditorComponent(this.querySelector(".meeting-abstract") as HTMLElement);
        this.agendaEditor = new EditorComponent(this.querySelector(".meeting-agenda") as HTMLElement);
        this.minutesEditor = new EditorComponent(this.querySelector(".meeting-minutes") as HTMLElement);
        this.saveButtonElement = this.querySelector(".save-button") as HTMLButtonElement;
        this.deleteButtonElement = this.querySelector(".delete-button") as HTMLButtonElement;
        this.titleElement = this.querySelector("h2") as HTMLElement;
        this.nameInputElement = this.querySelector(".meeting-name") as HTMLInputElement;
        this.dateDatePicker = new pikaday({ field: this.querySelector(".meeting-date") as HTMLInputElement });
        this.startDatePicker = rome(this.querySelector(".meeting-start"));
        this.endDatePicker = rome(this.querySelector(".meeting-end"));
        this.titleElement.textContent = "Create Meeting";
        this.saveButtonElement.addEventListener("click", this.onSave.bind(this));
        this.deleteButtonElement.addEventListener("click", this.onDelete.bind(this));
        
        if (this.meetingId) {
            this._meeting.getById(this.meetingId).then((results: string) => { 
                var resultsJSON: Meeting = JSON.parse(results) as Meeting;                
                this.nameInputElement.value = resultsJSON.name;              
                this.abstractEditor.setHTML(resultsJSON.abstract || "");
                this.agendaEditor.setHTML(resultsJSON.agenda || "");
                this.minutesEditor.setHTML(resultsJSON.minutes || "");
                
                if (resultsJSON.date)
                    (this.querySelector(".meeting-date") as HTMLInputElement).value = moment(resultsJSON.date).format("YYYY-MM-DD");
            });
            this.titleElement.textContent = "Edit Meeting";
        } 
    }
    
    public onSave() {
        var meeting = {
            id: this.meetingId,
            date: (this.querySelector(".meeting-date") as HTMLInputElement).value,
            name: this.nameInputElement.value,
            abstract: this.abstractEditor.text,
            agenda: this.agendaEditor.text,
            minutes: this.minutesEditor.text
        } as Meeting;
        
        this._meeting.add(meeting).then((results) => {
            this.dispatchEvent(new MeetingAddSuccess(meeting));
        });
    }

    public onDelete() {        
        this._meeting.remove({ id: this.meetingId }).then((results) => {
            this.dispatchEvent(new MeetingDeleteSuccess(this.meetingId));
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {

            case "meeting-id":
                this.meetingId = newValue;

            default:
                break;
        }        
    }

    public meetingId: number;
    public titleElement: HTMLElement;
    public saveButtonElement: HTMLButtonElement;
    public deleteButtonElement: HTMLButtonElement;
    public nameInputElement: HTMLInputElement;
    public dateDatePicker: any;
    public startDatePicker: any;
    public endDatePicker: any;
    public abstractEditor: EditorComponent;
    public agendaEditor: EditorComponent;
    public minutesEditor: EditorComponent;
}

document.addEventListener("DOMContentLoaded",() => (window as any).customElements.define(`ce-meeting-edit-page`,MeetingEditPageComponent));
