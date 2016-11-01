import { Store } from "../utilities";

export class OAuthHelper {
    constructor(private _store: Store = null) {
        _store = _store || new Store("theDebateApp");
    }

    public getOAuthHeaders() {                
        return {
            "Authorization": `Bearer ${this._store.get({ name: "token" })}`,
            "Content-Type" : "application/json;charset=UTF-8"
            };
    }
}