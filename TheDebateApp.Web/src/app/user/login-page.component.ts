let template = require("./login-page.component.html");
let styles = require("./login-page.component.scss");

export class LoginPageComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        let root = (this as any).attachShadow({mode: 'open'});
        root.innerHTML = `<style>${styles}</style> ${template}`; 
    }

    disconnectedCallback() {

    }

    attributeChangedCallback (name, oldValue, newValue) {

    }
}

document.addEventListener("DOMContentLoaded",function() {
    (window as any).customElements.define(`ce-login-page`,LoginPageComponent);
});
