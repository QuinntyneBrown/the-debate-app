import { Store } from "../utilities";
import { LoginRedirect } from "./login-redirect";

interface RouterConfig {
    root: HTMLElement,
    routes: Array<{ path: string, selector: string, authRequired?: boolean }>,
    routeChangedCallback: Function,
    store:Store
}

export class RouterComponent {
    constructor(private _root:any, private _routes:Array<{ path:string, selector:string, authRequired?:boolean }>, private routeChangedCallback) {                
        (history as any).onpushstate = (e) => { this._onChanged(e.state); }        
        this._onChanged({ route: window.location.pathname});
        window.onpopstate = () => { this._onChanged({ route: window.location.pathname}); }
    }
    
    private _onChanged(state: { route: string }) {  
        if (state.route === this._location)
            return;

        this._location = state.route;

        for (var i = 0; i < this._routes.length; i++) {
            if(state.route === this._routes[i].path) {
                this._setRouterElement(`<${this._routes[i].selector}></${this._routes[i].selector}>`);                  
            }
        }
        
        this.routeChangedCallback();
    }

    private _setRouterElement(html:string) {
        this._rootAsHTML = document.createElement("div");
        this._rootAsHTML.innerHTML = this._root.innerHTML;        
        (this._rootAsHTML.querySelector("ce-router-outlet") as HTMLElement).innerHTML = html;
        this._root.innerHTML = this._rootAsHTML.innerHTML;
    }    

    private _loginRedirect;
    private _rootAsHTML;
    private _location: string;
}

