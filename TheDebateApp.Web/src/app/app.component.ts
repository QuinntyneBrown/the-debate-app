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
        let root = (this as any).attachShadow({mode: 'open'});
        root.innerHTML = `<style>${styles}</style> ${template}`; 
        this._router.addEventListener(this._onRouteChanged.bind(this));        
    }

    private _onRouteChanged(options: any) {
        var root = ((this as any).shadowRoot as HTMLElement);
        var div = document.createElement("div");

        if (root.querySelector("#router-outlet").childNodes.length > 0) {
            root.querySelector("#router-outlet").removeChild(root.querySelector("#router-outlet").firstChild);
        }

        switch (options.route) {
            case "home":
                div.innerHTML = "<ce-home-page></ce-home-page>";
                break;

            case "meetings":
                div.innerHTML = "<ce-meetings-page></ce-meetings-page>";
                break;
        }

        root.querySelector("#router-outlet").appendChild(div.firstChild);
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
