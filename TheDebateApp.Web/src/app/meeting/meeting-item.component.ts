import { Meeting } from "./meeting.model";
import { MeetingEditSelect, MeetingViewSelect, MeetingDeleteSelect } from "./actions";
let template = require("./meeting-item.component.html");
let styles = require("./meeting-item.component.scss");

export class MeetingItemComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return [
            "meeting"
        ];
    }

    connectedCallback() {
        this.innerHTML = `<style>${styles}</style> ${template}`; 
        this.querySelector("h2").textContent = this.meeting.name;
        this.querySelector("p").innerHTML = this.meeting.abstract;
        this.querySelector("a.meeting-item-edit").addEventListener("click", this.onEditClick.bind(this));
        this.querySelector("a.meeting-item-view").addEventListener("click", this.onViewClick.bind(this));
        this.querySelector("a.meeting-item-delete").addEventListener("click", this.onDeleteClick.bind(this));
    }

    public onEditClick() {
        this.dispatchEvent(new MeetingEditSelect(this.meeting.id));
    }

    public onViewClick() {
        this.dispatchEvent(new MeetingViewSelect(this.meeting.id));
    }

    public onDeleteClick() {
        this.dispatchEvent(new MeetingDeleteSelect(this.meeting.id));
    }

    disconnectedCallback() {

    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "meeting":
                this.meeting = JSON.parse(newValue);
                break;

            default:
                break;
        }
    }

    public meeting: Meeting;
}

document.addEventListener("DOMContentLoaded",() => window.customElements.define(`ce-meeting-item`,MeetingItemComponent));
