import "./app";
import { Router, registerInstance, appServices, Route, Store } from "./app";

registerInstance(new Router([
    { path: "/", name: "home" },
    { path: "/login", name: "login", authRequired: false },
    { path: "/meetings", name: "meetings", authRequired: true },
    { path: "/meeting/:id", name: "meeting", authRequired: true },
    { path: "/meeting/:id/updateminutes", name: "update-meeting-minutes", authRequired: true }
] as Array<Route>), appServices.router);

registerInstance(new Store("theDebateApp"), appServices.store);