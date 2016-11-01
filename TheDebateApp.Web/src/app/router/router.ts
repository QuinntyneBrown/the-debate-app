import { Store } from "../utilities";
import { LoginRedirect } from "./login-redirect";
import { Route } from "./route";

export class Router {
    constructor(private _routes: Array<Route>) {                
        this._addEventListeners();
        this.onChanged({ route: window.location.pathname });
    }
    
    public onChanged(state: { route?: string, routeSegments?: Array<any> }) { 
        if (state.routeSegments)
            state.route = "/" + state.routeSegments.join("/");

        for (var i = 0; i < this._routes.length; i++) {
            if (state.route == this._routes[i].path) {
                this._routeName = this._routes[i].name;
                this.routePath = this._routes[i].path;
            }
        }                
        history.pushState({}, this._routeName, state.route);
        this._callbacks.forEach(callback => callback({ route: this._routeName }));
    }

    public navigate(routeSegments:Array<any>) {
        this.onChanged({ routeSegments: routeSegments });
    }

    public _addEventListeners() {
        window.onpopstate = () => { this.onChanged({ route: window.location.pathname }); }
    }

    public addEventListener(callback: any) {        
        this._callbacks.push(callback);
        if (this._routeName) {
            callback({ route: this._routeName });
        }
    }

    private _routeName: string;
    public routePath: string;
    public routeParams = { id: 3 };
    private _callbacks: Array<any> = [];
    private _loginRedirect;
    private _rootAsHTML;
    private _location: string;
}

