import { fetch } from "../utilities";

export class MeetingService {
    public static get() {
        return fetch({ url: "/api/meeting/get" });
    }
}