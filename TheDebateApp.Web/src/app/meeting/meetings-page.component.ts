import { Meeting } from "./meeting.model";
import { MeetingService } from "./meeting.service";
import { resolve, appServices } from "../container";
import { createElement } from "../utilities";

let template = require("./meetings-page.component.html");
let styles = require("./meetings-page.component.scss");

let customInnerHTML = `<style>${styles}</style> ${template}`;

export class MeetingsPageComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        let root = (this as any).attachShadow({mode: 'open'});
        root.innerHTML = customInnerHTML; 
        MeetingService.get().then((results: string) => {
            var resultsJSON: Array<Meeting> = JSON.parse(results) as Array<Meeting>;
            for (var i = 0; i < resultsJSON.length; i++) {
                (this as any).shadowRoot.appendChild(createElement(`<ce-meeting name='${resultsJSON[i].name}'></ce-meeting>`));
            }
        });
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {

    }
    
}

document.addEventListener("DOMContentLoaded",function() {
    (window as any).customElements.define("ce-meetings-page",MeetingsPageComponent);
});
