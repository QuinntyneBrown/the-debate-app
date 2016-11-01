import { fetch, formEncode } from "../utilities";

export class UserService {

    public get() {
        return fetch({ url: "/api/user/get" });
    }

    public getById(id) {
        return fetch({ url: `/api/user/getbyid?id=${id}` });
    }

    public add(entity) {
        return fetch({ url: `/api/user/add`, method: "POST", data: entity });
    }

    public remove(options: { id: number }) {
        return fetch({ url: `/api/user/remove?id=${options.id}`, method: "DELETE" });
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