import { appendToTargetAsync, extendCssAsync, removeElement, setOpacityAsync, createElement } from "../utilities";

export class Backdrop {
    constructor(
        private _createElement: any = null,
        private _appendToTargetAsync: any = null,
        private _extendCssAsync: any = null,
        private _removeElement: any = null,
        private _setOpacityAsync: any = null) {

        _createElement = _createElement || createElement;
        _appendToTargetAsync = _appendToTargetAsync || appendToTargetAsync;
        _extendCssAsync = _extendCssAsync || extendCssAsync;
        _removeElement = _removeElement || removeElement;
        _setOpacityAsync = _setOpacityAsync || setOpacityAsync;
    }

    public createInstance = (options: any) => {
        var instance = new Backdrop(this._createElement, this._appendToTargetAsync, this._extendCssAsync, this._removeElement, this._setOpacityAsync);
        return instance;
    }

    public openAsync = (options: {target:HTMLElement}) => {
        return new Promise(resolve => {
            this.initializeAsync()
                .then(() => this._appendToTargetAsync({ target: options.target, element: this._element }))
                .then(this.showAsync)
                .then(() => {
                    this.isOpen = true;
                    resolve();
                });

        });
    }

    public closeAsync = () => {
        return new Promise(resolve => {
            this.hideAsync().then((results) => {
                this.dispose();
                this.isOpen = false;
                resolve();
            });
        });
    }

    public initializeAsync = () => {
        return new Promise(resolve => {
            this._element = createElement("<div></div>");
            this._extendCssAsync({
                nativeHTMLElement: this._element,
                cssObject: {
                    "-webkit-transition": "opacity 300ms ease-in-out",
                    "-o-transition": "opacity 300ms ease-in-out",
                    "transition": "opacity 300ms ease-in-out",
                    "opacity": "0",
                    "position": "fixed",
                    "top": "0",
                    "left": "0",
                    "height": "100%",
                    "width": "100%",
                    "background-color": "rgba(0, 0, 0, .25)",
                    "display": "block"
                }
            }).then(() => {
                resolve();
            });
        });
    }

    public showAsync = () => {
        return this._setOpacityAsync({ nativeHtmlElement: this._element, opacity: 25 });
    }

    public hideAsync = () => {
        return this._setOpacityAsync({ nativeHtmlElement: this._element, opacity: 0 });
    }

    public dispose = () => {
        this._removeElement({ nativeHTMLElement: this._element });
        this._element = null;
    }
    
    private _element: HTMLElement;

    public isOpen: boolean = false;

    public isAnimating: boolean = false;
}