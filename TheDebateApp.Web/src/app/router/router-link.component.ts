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
            "href",
            "active"
        ];
    }

    connectedCallback() {
        
        this.addEventListener("click", this.onClick.bind(this));        
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.onClick);
    }

    public onClick() {
        window.history.pushState({ route: this.getAttribute("href") }, null, this.getAttribute("href"));
    }

    attributeChangedCallback(name, oldValue, newValue) {   
        switch (name) {
            case "href":
                this._href = newValue;
                break;
            case "active":
                this.classList.remove("active");
                if (newValue == "true")
                    this.classList.add("active");                
                break;
        }
        this._href = newValue;
    }
    
    private _href: string;
    private _root;
}

document.addEventListener("DOMContentLoaded", function () {
    (window as any).customElements.define(`${prefix}-${selector}`, RouterLinkComponent);
});
