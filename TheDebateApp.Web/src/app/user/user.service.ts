import { fetch, formEncode } from "../utilities";

export class UserService {

    public tryToLogin(options: { username: string, password: string }) {
        Object.assign(options, { grant_type: "password" });        
        return fetch({
            url: "/api/user/token",
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