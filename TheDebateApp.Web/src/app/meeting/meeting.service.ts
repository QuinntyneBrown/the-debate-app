import { fetch } from "../utilities";
import { Meeting  } from "./meeting.model";

export class MeetingService {
    
    public get() {
        return fetch({ url: "/api/meeting/get" });
    }

    public getById(id) {
        return fetch({ url: `/api/meeting/getbyid?id=${id}` });
    }

    public add(entity) {
        return fetch({ url: `/api/meeting/add`, method: "POST", data: entity });
    }

    public remove(options: { id : number }) {
        return fetch({ url: `/api/meeting/remove?id=${options.id}`, method: "DELETE" });
    }
    
}