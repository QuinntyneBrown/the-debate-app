/// <reference path="meeting/actions.ts" />
import { Router } from "./router";
import { Store, createElement } from "./utilities";
import { resolve, appServices } from "./container";

let template = require("./app.component.html");
let styles = require("./app.component.scss");

import { meetingActions } from "./meeting/actions";

export class AppComponent extends HTMLElement {
    constructor(private _router: Router = resolve(appServices.router),
    private _store: Store = resolve(appServices.store)) {
        super();                
    }

    static get observedAttributes () {
        return [];
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
                view = createElement(`<ce-meeting-edit-page meeting-id='3'></ce-meeting-edit-page>`);                
                //div.innerHTML = "<ce-home-page></ce-home-page>";                
                break;

            case "meetings":
                view = createElement("<ce-meetings-page></ce-meetings-page>");
                break;

            case "meeting-create":
                view = createElement("<ce-meeting-edit-page></ce-meeting-edit-page>");
                break;
        }

        this.querySelector("#router-outlet").appendChild(view);

        this._addMeetingEventListeners();
        
    }

    private _addMeetingEventListeners() {
        this.querySelector("#router-outlet").firstChild.addEventListener(meetingActions.ADD_SUCCESS, this.onMeetingActionSuccess.bind(this));
        this.querySelector("#router-outlet").firstChild.addEventListener(meetingActions.DELETE_SUCCESS, this.onMeetingActionSuccess.bind(this));        
    }

    private _removeMeetingEventListeners() {
        this.querySelector("#router-outlet").firstChild.removeEventListener(meetingActions.ADD_SUCCESS, this.onMeetingActionSuccess.bind(this));
        this.querySelector("#router-outlet").firstChild.removeEventListener(meetingActions.DELETE_SUCCESS, this.onMeetingActionSuccess.bind(this));
    }

    public onMeetingActionSuccess() {        
        this._router.navigate(["meetings"]);
    }
    
    attributeChangedCallback (name, oldValue, newValue) {
        switch (name) {
            default:
                break;
        }
    }    

}

document.addEventListener("DOMContentLoaded",function() { (window as any).customElements.define("ce-app", AppComponent); });
