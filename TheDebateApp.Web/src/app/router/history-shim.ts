let pushState = history.pushState;
history.pushState = function (state) {
    if (typeof (history as any).onpushstate == "function") {
        (history as any).onpushstate({ state: state });
    }
    return pushState.apply(history, arguments);
}