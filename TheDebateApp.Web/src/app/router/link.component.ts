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
        this._router.addEventListener(this.onRouteChange.bind(this));
        this.style.cursor = "pointer";
    }

    public onRouteChange(state: any) {
        (this as any).classList.remove("active");
        if (this.route == this._router.routePath)
            (this as any).classList.add("active");
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
                if (newValue)
                    this.routeSegments = JSON.parse(newValue);
                break;
        }
    }

    public routeSegments: Array<any>;
    public get route() {
        if (!this.routeSegments)
            return "";
        return "/" + this.routeSegments.join("/");
    }

}

document.addEventListener("DOMContentLoaded", () => (window as any).customElements.define(`ce-link`, LinkComponent));
