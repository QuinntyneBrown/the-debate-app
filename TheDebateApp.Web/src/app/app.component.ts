import { RouterComponent } from "./router";
import { Store } from "./utilities";
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
        return [
            "storekey"
        ];
    }

    private _store: Store;
    private _storeKey: string;

    connectedCallback() {
        this._root = (this as any).attachShadow({mode: 'open'});
        this._root.innerHTML = customInnerHTML; 
        this._store = new Store(this._storeKey);
        this._router = new RouterComponent(this._root, [
            { path: "/", selector: "ce-home-page" },
            { path: "/login", selector: "ce-login-page", authRequired: false },
            { path: "/meetings", selector: "ce-meetings-page", authRequired: true },
            { path: "/meeting", selector: "ce-meeting-page", authRequired: true }
        ], this._onRouteChanged);                
    }

    private _onRouteChanged() {
        
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {
        switch (name) {
            case "storekey":
                this._storeKey = newValue;
                break;
        }
    }

    private _root;
    private _router: RouterComponent;

}

document.addEventListener("DOMContentLoaded",function() {
    (window as any).customElements.define(`${prefix}-${selector}`,AppComponent);
});
