let template = require("./meeting.component.html");
let styles = require("./meeting.component.scss");

export class MeetingComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [
            "name"
        ];
    }

    connectedCallback() {
        let root = (this as any).attachShadow({mode: 'open'});
        root.innerHTML = `<style>${styles}</style> ${template}`;
        (this as any).shadowRoot.querySelector("h2").textContent = this.name; 
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {
        switch (name) {
            case "name":
                this.name = newValue;
                break;

            default:
                break;
        }
    }

    name;
    
}

document.addEventListener("DOMContentLoaded",() => (window as any).customElements.define(`ce-meeting`,MeetingComponent));
