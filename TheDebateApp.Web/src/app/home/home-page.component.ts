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
        this._image = this._root.querySelector("img");
        this._image.setAttribute("src", "/src/images/logo.jpg");
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {

    }

    private _root;
    private _image: HTMLImageElement;
}

document.addEventListener("DOMContentLoaded",function() {
    (window as any).customElements.define(`${prefix}-${selector}`,HomePageComponent);
});
