export var fetch = (options: { url: string, method?: string, data?:any, headers?:any }) => {
    return new Promise(resolve => {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method || "GET", options.url, true);

        options.headers = options.headers || { "Content-Type": "application/json;charset=UTF-8" };
        
        for (var prop in options.headers) {
            xhr.setRequestHeader(prop, options.headers[prop]);
        }
        
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
        xhr.send(JSON.stringify(options.data));
    });
}

