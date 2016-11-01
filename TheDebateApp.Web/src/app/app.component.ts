import { Router } from "./router";
import { Store } from "./utilities";
import { resolve, appServices } from "./container";

let template = require("./app.component.html");
let styles = require("./app.component.scss");

export class AppComponent extends HTMLElement {
    constructor(private _router: Router = resolve(appServices.router),
    private _store: Store = resolve(appServices.store)) {
        super();        
        
    }

    static get observedAttributes () {
        return [];
    }
    
    
    connectedCallback() {
        this.innerHTML = `<style>${styles}</style> ${template}`; 
        this._router.addEventListener(this._onRouteChanged.bind(this));        
    }

    private _onRouteChanged(options: any) {
        
        var div = document.createElement("div");

        if (this.querySelector("#router-outlet").childNodes.length > 0) {
            this.querySelector("#router-outlet").removeChild(this.querySelector("#router-outlet").firstChild);
        }

        switch (options.route) {
            case "home":
                div.innerHTML = "<ce-meeting-edit-page></ce-meeting-edit-page>";
                //div.innerHTML = "<ce-home-page></ce-home-page>";
                break;

            case "meetings":
                div.innerHTML = "<ce-meetings-page></ce-meetings-page>";
                break;

            case "meeting-create":
                div.innerHTML = "<ce-meeting-edit-page></ce-meeting-edit-page>";
                break;
        }

        this.querySelector("#router-outlet").appendChild(div.firstChild);
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

document.addEventListener("DOMContentLoaded",function() { (window as any).customElements.define("ce-app", AppComponent); });
