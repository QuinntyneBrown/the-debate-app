let template = require("./home-page.component.html");
let styles = require("./home-page.component.scss");

export class HomePageComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        let root = (this as any).attachShadow({mode: 'open'});
        root.innerHTML = `<style>${styles}</style> ${template}`; 
        this._image = root.querySelector("img");
        this._image.setAttribute("src", "/src/images/logo.jpg");
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {

    }
    
    private _image: HTMLImageElement;
}

document.addEventListener("DOMContentLoaded", () => (window as any).customElements.define("ce-home-page",HomePageComponent));
