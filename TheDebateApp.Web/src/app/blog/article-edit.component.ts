import { Article } from "./article.model";
import { ArticleService } from "./article.service";
import { EditorComponent } from "../shared";
import { ArticleAddSuccess, ArticleDeleteSuccess } from "./actions";

const template = require("./article-edit.component.html");
const styles = require("./article-edit.component.scss");

export class ArticleEditComponent extends HTMLElement {
    constructor(private _article: ArticleService = null) {
        super();

        this._article = _article || new ArticleService();
    }

    static get observedAttributes() {
        return ["article-id"];
    }
    
    connectedCallback() {        
        this.innerHTML = `<style>${styles}</style> ${template}`; 
        this.saveButtonElement = this.querySelector(".save-button") as HTMLButtonElement;
        this.deleteButtonElement = this.querySelector(".delete-button") as HTMLButtonElement;
        this.titleElement = this.querySelector("h2") as HTMLElement;
        this.nameInputElement = this.querySelector(".article-name") as HTMLInputElement;
        this.titleElement.textContent = "Create article";
        this.saveButtonElement.addEventListener("click", this.onSave.bind(this));
        this.deleteButtonElement.addEventListener("click", this.onDelete.bind(this));
        
        if (this.articleId) {
            this._article.getById(this.articleId).then((results: string) => { 
                var resultsJSON: Article = JSON.parse(results) as Article;                
                this.nameInputElement.value = resultsJSON.name;              
            });
            this.titleElement.textContent = "Edit article";
        } 
    }
    
    public onSave() {
        var article = {
            id: this.articleId,
            name: this.nameInputElement.value
        } as Article;
        
        this._article.add(article).then((results) => {
            this.dispatchEvent(new ArticleAddSuccess(article));
        });
    }

    public onDelete() {        
        this._article.remove({ id: this.articleId }).then((results) => {
            this.dispatchEvent(new ArticleDeleteSuccess(this.articleId));
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {

            case "article-id":
                this.articleId = newValue;
				break;
        }        
    }

    public articleId: number;
    public titleElement: HTMLElement;
    public saveButtonElement: HTMLButtonElement;
    public deleteButtonElement: HTMLButtonElement;
    public nameInputElement: HTMLInputElement;
}

document.addEventListener("DOMContentLoaded",() => window.customElements.define(`ce-article-edit`,ArticleEditComponent));
