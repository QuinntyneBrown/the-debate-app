import { fetch } from "../utilities";
import { Meeting  } from "./meeting.model";

export class MeetingService {
    
    public static get() {
        return fetch({ url: "/api/meeting/get" });
    }

    public static getById(id) {
        return fetch({ url: `/api/meeting/getbyid?id=${id}` });
    }

    public static add(entity) {
        return fetch({ url: `/api/meeting/add`, method: "POST", data: entity });
    }

    public static remove(options: { id : number }) {
        return fetch({ url: `/api/meeting/remove?id=${options.id}`, method: "DELETE" });
    }
    
}