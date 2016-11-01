import { environment } from "./environment";

(window as any)[environment.applicationContextName] = {};

export const resolve = (serviceType: appServices) => {
    return (window as any)[environment.applicationContextName][serviceType];
};

export const registerInstance = (instance: any, serviceType: appServices) => {
    (window as any)[environment.applicationContextName][serviceType] = instance;
}

export enum appServices {
    meetingService,
    router,
    store
}