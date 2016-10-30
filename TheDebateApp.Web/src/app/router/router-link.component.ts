let customElements: any;
let template = require("./router-link.component.html");

const prefix: string = "ce";
const selector: string = "router-link";

export class RouterLinkComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return [
            "href"
        ];
    }

    connectedCallback() {
        var textContent = this.textContent;
        this._root = (this as any).attachShadow({ mode: 'open' });        
        this._root.innerHTML = template;
        this._root.textContent = textContent;
        this.addEventListener("click", (e) => {
            window.history.pushState({ route:this._href }, null, this._href);
        });
        
    }

    disconnectedCallback() {

    }

    attributeChangedCallback(name, oldValue, newValue) {        
        this._href = newValue;
    }
    private _href: string;
    private _root;
}

document.addEventListener("DOMContentLoaded", function () {
    (window as any).customElements.define(`${prefix}-${selector}`, RouterLinkComponent);
});
