import { RouterComponent } from "./router";

let customElements: any;
let template = require("./app.component.html");
let styles = require("./app.component.scss");

const prefix: string = "ce";
const selector: string = "app";
let customInnerHTML = `<style>${styles}</style> ${template}`;


export class AppComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        this._root = (this as any).attachShadow({mode: 'open'});
        this._root.innerHTML = customInnerHTML; 
        this._router = new RouterComponent(this._root, [
            { path: "/", selector: "ce-home-page" },
            { path: "/login", selector: "ce-login-page", authRequired: true },
            { path: "/meetings", selector: "ce-meetings-page", authRequired: true },
            { path: "/meeting", selector: "ce-meeting-page", authRequired: true }
        ], this._onRouteChanged);
        
    }

    private _onRouteChanged() {
        
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {

    }

    private _root;
    private _router: RouterComponent;

}

document.addEventListener("DOMContentLoaded",function() {
    (window as any).customElements.define(`${prefix}-${selector}`,AppComponent);
});
