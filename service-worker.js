/**
 * Note: allowing a different scope for the service worker than the
 * directory the file is contained in requires to set a http header
 * -> for github it is easier to move the service worker into the
 *    required scope folder
 */
var cachePatterns = [
    new RegExp(/(\.ttf|\.png|\.jpe?g|\.gif|\.ico)$/)
];

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
        e.respondWith(modifiedRequest(e.request));
    }else{
        e.respondWith(fetch(e.request));
    }
});

function modifiedRequest(request) {
    request = new Request(
        request.url,
        {
            method : request.method,
            header : request.headers,
            body : request.body,
            mode : request.mode,
            credentials : request.credentials,
            cache : "force-cache",
            redirect : request.redirect,
            referrer : request.referrer,
            integrity : request.integrity
        }
    )
    return fetch(request);
}

function matchesCachePattern(url) {
    for (const pattern of cachePatterns) {
        if (pattern.test(url)) {
            return true;
        }
    }
    return false;
}