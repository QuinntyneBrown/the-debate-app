let template = require("./upload.component.html");
let styles = require("./upload.component.scss");

export class UploadComponent extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes () {
        return [];
    }

    connectedCallback() {
        this.innerHTML = `<style>${styles}</style> ${template}`; 
        this.drop = this.querySelector(".drop-zone");
        this.drop.addEventListener("dragover", this.onDragOver.bind(this));
        this.drop.addEventListener("drop", this.onDrop.bind(this), false);
    }

    onDragOver(dragEvent: DragEvent) {
        dragEvent.stopPropagation();
        dragEvent.preventDefault();
    }

    disconnectedCallback() {
        this.drop.removeEventListener("drop", this.onDrop.bind(this), false);
    }

    public onDrop(dragEvent: DragEvent) {
        dragEvent.stopPropagation();
        dragEvent.preventDefault();

        if (dragEvent.dataTransfer && dragEvent.dataTransfer.files) {
            var packageFiles = function (fileList: FileList) {
            var formData = new FormData();
            for (var i = 0; i < fileList.length; i++) {
                formData.append(fileList[i].name, fileList[i]);
            }
            return formData;
        }
        var files = packageFiles(dragEvent.dataTransfer.files);
        
        this.dispatchEvent(new CustomEvent("upload", {
            detail: { files }
        }));
        }
    }

    attributeChangedCallback (name, oldValue, newValue) {
        switch (name) {
            default:
                break;
        }
    }

    drop: any;
}

document.addEventListener("DOMContentLoaded",() => window.customElements.define(`ce-upload`,UploadComponent));
