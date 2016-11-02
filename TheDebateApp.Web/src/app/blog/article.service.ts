import { fetch } from "../utilities";
import { Article } from "./article.model";

export class ArticleService {
    
    public get() {
        return fetch({ url: "/api/article/get" });
    }

    public getById(id) {
        return fetch({ url: `/api/article/getbyid?id=${id}` });
    }

    public add(entity) {
        return fetch({ url: `/api/article/add`, method: "POST", data: entity });
    }

    public remove(options: { id : number }) {
        return fetch({ url: `/api/article/remove?id=${options.id}`, method: "DELETE" });
    }
    
}
