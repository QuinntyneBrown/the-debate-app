let customElements:any;
let template = require("./router.component.html");

const prefix: string = "ce";
const selector: string = "router";

let pushState = history.pushState;
history.pushState = function (state) {
    if (typeof (history as any).onpushstate == "function") {
        (history as any).onpushstate({ state: state });
    }
    return pushState.apply(history, arguments);
}

export class RouterComponent {
    constructor(private _root:any, private _routes:Array<{ path:string, selector:string }>) {        
        
        (history as any).onpushstate = (e) => { this._onChanged(e.state); }        
        this._onChanged({ route: window.location.pathname});

        window.onpopstate = () => { this._onChanged({ route: window.location.pathname}); }
    }
    
    private _onChanged(state: { route: string }) {                              
        for (var i = 0; i < this._routes.length; i++) {
            if(state.route === this._routes[i].path) {
                this._setRouterElement(`<${this._routes[i].selector}></${this._routes[i].selector}>`);    
            }
        }
    }

    private _setRouterElement(html:string) {
        this._rootAsHTML = document.createElement("div");
        this._rootAsHTML.innerHTML = this._root.innerHTML;        
        (this._rootAsHTML.querySelector("ce-router") as HTMLElement).innerHTML = html;
        this._root.innerHTML = this._rootAsHTML.innerHTML;
    }    

    private _rootAsHTML;
}

