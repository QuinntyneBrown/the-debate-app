let template = require("./meeting-page.component.html");
let styles = require("./meeting-page.component.scss");

export class MeetingPageComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        let root = (this as any).attachShadow({mode: 'open'});
        root.innerHTML = `<style>${styles}</style> ${template}`; 
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {
        switch (name) {
            default:
                break;
        }
    }
}

document.addEventListener("DOMContentLoaded",function() {
    (window as any).customElements.define(`ce-meeting-page`,MeetingPageComponent);
});
