import "./app";
import { Router,
    registerInstance,
    appServices,

    MeetingService,
    Route,
    Store } from "./app";


registerInstance(new MeetingService(), appServices.meetingService);

registerInstance(new Router([
    { path: "/", name: "home" },
    { path: "/login", name: "login", authRequired: false },
    { path: "/meetings", name: "meetings", authRequired: true },
    { path: "/meeting/:id", name: "meeting", authRequired: true },
    { path: "/meeting/create", name: "meeting-create", authRequired: true },
    { path: "/meeting/:id/updateminutes", name: "update-meeting-minutes", authRequired: true }
] as Array<Route>), appServices.router);

registerInstance(new Store("theDebateApp"), appServices.store);