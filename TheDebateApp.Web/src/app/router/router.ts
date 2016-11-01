import { Store, isNumeric } from "../utilities";
import { LoginRedirect } from "./login-redirect";
import { Route } from "./route";

export class Router {
    constructor(private _routes: Array<Route>) {                
        this._addEventListeners();
        this.onChanged({ route: window.location.pathname });
    }
    
    public onChanged(state: { route?: string, routeSegments?: Array<any> }) { 
        var routeParams = {};

        var match = false;
        if (state.routeSegments)
            state.route = "/" + state.routeSegments.join("/");

        for (var i = 0; i < this._routes.length; i++) {
            if (state.route == this._routes[i].path) {
                this._routeName = this._routes[i].name;
                this.routePath = this._routes[i].path;
                match = true;
            }
        }                

        if (!match) {            
            const _currentSegments = state.route.substring(1).split("/");
            for (var i = 0; i < this._routes.length; i++) {
                var segments = this._routes[i].path.substring(1).split("/");

                if (_currentSegments.length === segments.length) {
     
                    for (var x = 0; x < segments.length; x++) {
                        if (_currentSegments[x] == segments[x]) {
                            match = true;
                        } else if (segments[x].charAt(0) == ":" && isNumeric(_currentSegments[x])) {
                            match = true;
                            routeParams[segments[x].substring(1)] = _currentSegments[x];
                        } else {
                            match = false;
                        }
                    }

                    if (match) {
                        this.routeParams = routeParams;
                        this._routeName = this._routes[i].name;
                        this.routePath = this._routes[i].path;
                    }

                }
            }
        }

        
        
        history.pushState({}, this._routeName, state.route);
        this._callbacks.forEach(callback => callback({ route: this._routeName, params: this.routeParams }));
    }

    public navigate(routeSegments:Array<any>) {
        this.onChanged({ routeSegments: routeSegments });
    }

    public _addEventListeners() {
        window.onpopstate = () => this.onChanged({ route: window.location.pathname });    
    }

    public addEventListener(callback: any) {        
        this._callbacks.push(callback);
        if (this._routeName) {
            callback({ route: this._routeName, params: this.routeParams });
        }
    }

    private _routeName: string;
    public routePath: string;
    public routeParams;
    private _callbacks: Array<any> = [];
    private _loginRedirect;
    private _rootAsHTML;
    private _location: string;
}

