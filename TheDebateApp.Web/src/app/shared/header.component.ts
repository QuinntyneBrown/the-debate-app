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
        this._heading = this._root.querySelector("h2");
        this._heading.addEventListener("click", this.onHeaderClick.bind(this));
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {

    }

    onHeaderClick() {
        history.pushState({ route: "/" },null, "/");
    }

    private _root;
    private _heading: HTMLElement;
}

document.addEventListener("DOMContentLoaded",function() {
    (window as any).customElements.define(`${prefix}-${selector}`,HeaderComponent);
});
