import { MeetingService } from "./meeting.service";

let customElements: any;
let template = require("./meetings-page.component.html");
let styles = require("./meetings-page.component.scss");
const prefix: string = "ce";
const selector: string = "meetings-page";
let customInnerHTML = `<style>${styles}</style> ${template}`;

export class MeetingsPageComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        this._root = (this as any).attachShadow({mode: 'open'});
        this._root.innerHTML = customInnerHTML; 
        MeetingService.get().then(results => {
            
        });
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {

    }

	private _root;
}

document.addEventListener("DOMContentLoaded",function() {
    (window as any).customElements.define(`${prefix}-${selector}`,MeetingsPageComponent);
});
