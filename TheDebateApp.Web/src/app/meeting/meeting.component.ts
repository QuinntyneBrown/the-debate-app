import { Meeting } from "./meeting.model";

let template = require("./meeting.component.html");
let styles = require("./meeting.component.scss");

export class MeetingComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [
            "meeting"
        ];
    }

    connectedCallback() {
        this.innerHTML = `<style>${styles}</style> ${template}`;
        this.querySelector("h2").textContent = this.meeting.name; 
        this.querySelector("p").textContent = this.meeting.abstract;
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {
        switch (name) {
            case "meeting":
                this.meeting = JSON.parse(newValue);
                break;

            default:
                break;
        }
    }

    public meeting:Meeting;
    
}

document.addEventListener("DOMContentLoaded",() => window.customElements.define(`ce-meeting`,MeetingComponent));
