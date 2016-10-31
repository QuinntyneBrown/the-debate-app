import "../router/history-shim";

let customElements: any;
let template = require("./header.component.html");
let styles = require("./header.component.scss");
const prefix: string = "ce";
const selector: string = "header";
let customInnerHTML = `<style>${styles}</style> ${template}`;

export class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        let root = (this as any).attachShadow({ mode: 'open' });
        root.innerHTML = customInnerHTML; 
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        
        this._heading = (this as any).shadowRoot.querySelector("h2") as HTMLElement;
        this._heading.addEventListener("click", this.onHeaderClick.bind(this));
        this._addEventListeners();
    }

    private _addEventListeners() {
        document.addEventListener("routeChanged", this._onChanged.bind(this));
    }

    private _onChanged(state) {        

        //TODO: Figure out how this works with shadow DOM
        const routeLinks: Array<any> = Array.from((this as any).shadowRoot.querySelectorAll("ce-router-link"));
        
        for (var i = 0; i < routeLinks.length; i++) {
            (routeLinks[i] as HTMLElement).setAttribute("active", "false");
            if (state.route == routeLinks[i]._href)
                (routeLinks[i] as HTMLElement).setAttribute("active", "true");            
        }
    }

    disconnectedCallback() {
        document.removeEventListener("routeChanged", this._onChanged);
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
