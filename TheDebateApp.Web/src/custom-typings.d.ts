interface ModernWindow {
    customElements: any;
}

declare abstract class ShawdoDOMHTMLElement {
    attachShadow: (options:any) => HTMLElement;
}

interface Window extends ModernWindow { }

interface AppTransitionOptions {
    routeName: string;
    routeOutletNode: Node;
}

interface AppPlugIn {
    beforeViewTransition(options: AppTransitionOptions);
    onViewTransition(options: AppTransitionOptions);
    afterViewTransition(options: AppTransitionOptions);
}

declare var rome: any;

declare var Quill: any;