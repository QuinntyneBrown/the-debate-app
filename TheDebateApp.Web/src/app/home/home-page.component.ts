let customElements:any;
let template = require("./home-page.component.html");
let styles = require("./home-page.component.scss");
const prefix: string = "ce";
const selector: string = "home-page";
let customInnerHTML = `<style>${styles}</style> ${template}`;

export class HomePageComponent extends HTMLElement {
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
    (window as any).customElements.define(`${prefix}-${selector}`,HomePageComponent);
});
