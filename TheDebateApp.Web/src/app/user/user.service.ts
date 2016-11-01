import { fetch, formEncode } from "../utilities";
import { OAuthHelper } from "./oauth-helper";

export class UserService {
    constructor(private _oauthHelper: OAuthHelper = null) {
        _oauthHelper = _oauthHelper || new OAuthHelper();
    }

    public get() {
        return fetch({ url: "/api/user/get", headers: this._oauthHelper.getOAuthHeaders() });
    }

    public getById(id) {
        return fetch({ url: `/api/user/getbyid?id=${id}`, headers: this._oauthHelper.getOAuthHeaders() });
    }

    public add(entity) {
        return fetch({ url: `/api/user/add`, method: "POST", data: entity, headers: this._oauthHelper.getOAuthHeaders() });
    }

    public remove(options: { id: number }) {
        return fetch({ url: `/api/user/remove?id=${options.id}`, method: "DELETE", headers: this._oauthHelper.getOAuthHeaders() });
    }

    public tryToLogin(options: { username: string, password: string }) {
        Object.assign(options, { grant_type: "password" });        
        return fetch({
            url: "/api/user/token",
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: formEncode(options)
        });        
    }

    public regiser(options: { username: string, password: string }) {        
        return fetch({
            url: "/api/user/regiser",
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: formEncode(options)
        });
    }
    
    public getCurrentUser = () => fetch({
            url: "/api/user/current",
            method: "GET"
        });       

}