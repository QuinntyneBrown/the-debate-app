import { Router } from "./router";
import { Store, createElement } from "./utilities";
import { resolve, appServices } from "./container";
import { meetingActions, MeetingEditSelect } from "./meeting/actions";

const template = require("./app.component.html");
const styles = require("./app.component.scss");

export class AppComponent extends HTMLElement {
    constructor(private _router: Router = resolve(appServices.router),
    private _store: Store = resolve(appServices.store)) {
        super();                
    }
        
    connectedCallback() {
        this.innerHTML = `<style>${styles}</style> ${template}`; 
        this._router.addEventListener(this._onRouteChanged.bind(this));        
    }

    private _onRouteChanged(options: any) {
        var view = null;

        if (this.querySelector("#router-outlet").childNodes.length > 0) {
            this._removeMeetingEventListeners();
            this.querySelector("#router-outlet").removeChild(this.querySelector("#router-outlet").firstChild);
        }
        
        switch (options.route) {
            case "home":
                view = createElement(`<ce-home-page></ce-home-page>`);                               
                break;

            case "meetings":
                view = createElement("<ce-meetings></ce-meetings>");
                break;

            case "meeting":
                view = createElement(`<ce-meeting-edit meeting-id='${options.params.id}'></ce-meeting-edit>`);
                break;

            case "meeting-create":
                view = createElement("<ce-meeting-edit></ce-meeting-edit>");
                break;

            case "login":
                view = createElement("<ce-login></ce-login>");
                break;
        }

        this.querySelector("#router-outlet").appendChild(view);

        this._addMeetingEventListeners();
        
    }

    private _addMeetingEventListeners() {
        this.querySelector("#router-outlet").firstChild.addEventListener(meetingActions.ADD_SUCCESS, this.onMeetingActionSuccess.bind(this));
        this.querySelector("#router-outlet").firstChild.addEventListener(meetingActions.DELETE_SUCCESS, this.onMeetingActionSuccess.bind(this));
        this.querySelector("#router-outlet").firstChild.addEventListener(meetingActions.SELECT, this.onMeetingSelect.bind(this));        
    }

    private _removeMeetingEventListeners() {
        this.querySelector("#router-outlet").firstChild.removeEventListener(meetingActions.ADD_SUCCESS, this.onMeetingActionSuccess.bind(this));
        this.querySelector("#router-outlet").firstChild.removeEventListener(meetingActions.DELETE_SUCCESS, this.onMeetingActionSuccess.bind(this));
        this.querySelector("#router-outlet").firstChild.removeEventListener(meetingActions.SELECT, this.onMeetingSelect.bind(this));
    }

    public onMeetingActionSuccess() {        
        this._router.navigate(["meetings"]);
    }

    public onMeetingSelect(event: MeetingEditSelect) {
        this._router.navigate(["meeting", event.detail.meetingId ]);
    }
}

document.addEventListener("DOMContentLoaded",() => window.customElements.define("ce-app", AppComponent));
