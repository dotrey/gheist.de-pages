/**
 * Note: allowing a different scope for the service worker than the
 * directory the file is contained in requires to set a http header
 * -> for github it is easier to move the service worker into the
 *    required scope folder
 */
var cacheName = "static-cache";
var outsideClient = null;

self.addEventListener("install", function(e){
    e.waitUntil(buildCache());
});

self.addEventListener("fetch", function(e){
    if (e.request.url.substr(-4) === ".ttf") {
        log("sw from cache");
        e.respondWith(fromCache(e.request));
    }else if (e.request.url.substr(-5) === ".ghst") {
        log("sw custom");
        e.respondWith(new Response("Hello World"));
    }else{
        log("sw fetch");
        e.respondWith(fetch(e.request));
    }
});

self.addEventListener("message", function(e) {
    outsideClient = e.source;
});

function buildCache() {
    return caches.open(cacheName).then(function(cache) {
        return cache.addAll([
            "/style/font/OpenSans-Regular.ttf",
            "/style/font/RobotoMono-Regular.ttf"
        ]);
    });
}

function fromCache(request) {
    return caches.match(request).then(function(match) {
        return match || fetch(request);
    });
}

function update(request) {
    return caches.open(cacheName).then(function(cache) {
        return fetch(request).then(function(response) {
            return cache.put(request, response);
        });
    });
}

function log(msg) {
    console.log(msg);
    if (!outsideClient) {
        return;
    }
    outsideClient.postMessage(msg);
}