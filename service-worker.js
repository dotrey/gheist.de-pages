/**
 * Note: allowing a different scope for the service worker than the
 * directory the file is contained in requires to set a http header
 * -> for github it is easier to move the service worker into the
 *    required scope folder
 */
var cachePatterns = [
    new RegExp(/(\.ttf|\.png|\.jpe?g|\.gif|\.ico)$/)
];
var cacheDuration = 60 * 60 * 24 * 365;

self.addEventListener("install", function(e){
    if ("skipWaiting" in self) {
        self.skipWaiting();
    }
});

self.addEventListener("activate", function(e){
    if (typeof clients !== "undefined" && "claim" in clients) {
        e.waitUntil(clients.claim());
    }
});

self.addEventListener("fetch", function(e){
    if (matchesCachePattern(e.request.url)) {
        e.respondWith(modifiedResponse(e.request));
    }else{
        e.respondWith(fetch(e.request));
    }
});

function modifiedResponse(request) {
    return fetch(request).then((response) => {
        let headers = new Headers(response.headers);
        headers.set("cache-control", "public, max-age=" + cacheDuration);
        return new Response(response.body, {
            status : response.status,
            statusText : response.statusText,
            headers : headers
        });
    });
}

function matchesCachePattern(url) {
    for (const pattern of cachePatterns) {
        if (pattern.test(url)) {
            return true;
        }
    }
    return false;
}