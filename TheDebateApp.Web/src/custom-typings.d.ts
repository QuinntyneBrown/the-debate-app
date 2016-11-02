interface ModernWindow {
    customElements: any;
}

declare abstract class ShawdoDOMHTMLElement {
    attachShadow: (options:any) => HTMLElement;
}

interface Window extends ModernWindow { }


declare var rome: any;

declare var Quill: any;