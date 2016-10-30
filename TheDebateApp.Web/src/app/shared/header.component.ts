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
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        this._root = (this as any).attachShadow({mode: 'open'});
        this._root.innerHTML = customInnerHTML; 
        this._heading = this._root.querySelector("h2");
        this._heading.addEventListener("click", this.onHeaderClick.bind(this));
        this._addEventListeners();
    }

    private _addEventListeners() {
        document.addEventListener("routeChanged", this._onChanged.bind(this));
    }

    private _onChanged(state) {        

        //TODO: Figure out how this works with shadow DOM
        var routeLinks = this._root.querySelectorAll("ce-router-link");
        
        for (var i = 0; i < routeLinks.length; i++) {
            routeLinks[i].classList.remove('menu__nav-item--active')
            if (state.route == routeLinks[i]._href)
                (routeLinks[i] as HTMLElement).classList.add('menu__nav-item--active');            
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
