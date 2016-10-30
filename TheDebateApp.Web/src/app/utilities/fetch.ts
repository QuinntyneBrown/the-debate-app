export var fetch = (options: { url: string, method?: string }) => {
    return new Promise(resolve => {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method || "GET", options.url, true);
        xhr.onload = (e) => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                }
                else {
                    console.error(xhr.statusText);
                }
            }
        };
        xhr.send(null);
    });
}

