import { appServices, resolve } from "../container";
import { Router } from "./router";

export class LinkComponent extends HTMLElement {
    constructor(private _router:Router = resolve(appServices.router)) {
        super();
    }

    static get observedAttributes () {
        return [
            "routesegments"
        ];
    }

    connectedCallback() {        
        this.addEventListener("click", this.onClick.bind(this));
    }

    onClick(e: Event) {   
        this._router.onChanged({ routeSegments: this.routeSegments });
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.onClick.bind(this));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        
        switch (name) {
            default:
                this.routeSegments = JSON.parse(newValue);
                break;
        }
    }

    public routeSegments:Array<any>;
}

document.addEventListener("DOMContentLoaded", () => (window as any).customElements.define(`ce-link`, LinkComponent));
