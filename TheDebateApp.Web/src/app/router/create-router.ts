import { Route } from "./route";
import { Router } from "./router";

export function createRouter(routes: Array<Route>): Router {
    return new Router(routes);
}