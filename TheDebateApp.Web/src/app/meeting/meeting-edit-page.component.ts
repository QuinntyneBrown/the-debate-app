import { Meeting } from "./meeting.model";
import { MeetingService } from "./meeting.service";
import { resolve, appServices } from "../container";
import { Router } from "../router";
import { EditorComponent } from "../shared";

var pikaday = require('pikaday');
var moment = require('moment');

let template = require("./meeting-edit-page.component.html");
let styles = require("./meeting-edit-page.component.scss");

export class MeetingEditPageComponent extends HTMLElement {
    constructor(private _meetingService: MeetingService = resolve(appServices.meetingService),
        private _router: Router = resolve(appServices.router)) {
        super();
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
        this.startInputElement = this.querySelector(".meeting-start") as HTMLInputElement;
        this.endInputElement = this.querySelector(".meeting-end") as HTMLInputElement;
        this.titleElement.textContent = "Create Meeting";
        this.saveButtonElement.addEventListener("click", this.onSave.bind(this));
        this.deleteButtonElement.addEventListener("click", this.onDelete.bind(this));
        
        if (this._router.routeParams && this._router.routeParams.id) {
            this._meetingService.getById(this._router.routeParams.id).then((results: string) => { 
                var resultsJSON: Meeting = JSON.parse(results) as Meeting;
                this.meetingId = resultsJSON.id;
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
        var data = {
            id: this.meetingId,
            date: (this.querySelector(".meeting-date") as HTMLInputElement).value,
            name: this.nameInputElement.value,
            abstract: this.abstractEditor.text,
            agenda: this.agendaEditor.text,
            minutes: this.minutesEditor.text
        };
        
        this._meetingService.add(data).then((results) => {
            this._router.navigate(["meetings"]);
        });
    }

    public onDelete() {        
        this._meetingService.remove({ id: this.meetingId }).then((results) => {
            this._router.navigate(["meetings"]);
        });
    }

    public meetingId: number;
    public titleElement: HTMLElement;
    public saveButtonElement: HTMLButtonElement;
    public deleteButtonElement: HTMLButtonElement;
    public nameInputElement: HTMLInputElement;
    public dateDatePicker: any;
    public startInputElement: HTMLInputElement;
    public endInputElement: HTMLInputElement;
    public abstractEditor: EditorComponent;
    public agendaEditor: EditorComponent;
    public minutesEditor: EditorComponent;
}

document.addEventListener("DOMContentLoaded",() => (window as any).customElements.define(`ce-meeting-edit-page`,MeetingEditPageComponent));
