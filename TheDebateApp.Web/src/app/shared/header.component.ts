let customElements:any;
let template = require("./header.component.html");
let styles = require("./header.component.scss");
const prefix: string = "ce";
const selector: string = "header";
let customInnerHTML = `<style>${styles}</style> ${template}`;

export class HeaderComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        this._root = (this as any).attachShadow({mode: 'open'});
        this._root.innerHTML = customInnerHTML; 
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {

    }

	private _root;
}

document.addEventListener("DOMContentLoaded",function() {
    (window as any).customElements.define(`${prefix}-${selector}`,HeaderComponent);
});
