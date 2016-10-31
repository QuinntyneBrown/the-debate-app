export class LinkComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [
            "href"
        ];
    }

    connectedCallback() {        
        this.addEventListener("click", this.onClick.bind(this));
    }

    onClick(e:Event) {        
        this.dispatchEvent(new CustomEvent("ceClick", {
            detail: {
                href: this.href
            }
        }));
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.onClick.bind(this));
    }

    attributeChangedCallback (name, oldValue, newValue) {
        switch (name) {
            default:
                this.href = newValue;
                break;
        }
    }

    public href;
}

document.addEventListener("DOMContentLoaded", () => (window as any).customElements.define(`ce-link`, LinkComponent));
