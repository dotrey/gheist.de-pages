/**
 * Note: allowing a different scope for the service worker than the
 * directory the file is contained in requires to set a http header
 * -> for github it is easier to move the service worker into the
 *    required scope folder
 */
var cacheName = "static-cache";

self.addEventListener("install", function(e){
    e.waitUntil(buildCache());
});

self.addEventListener("fetch", function(e){
    e.respondWith(fromCache(e.request));
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
    return caches.open(cacheName).then(function(cache) {
        return cache.match(request).then(function(match) {
            return match || fetch(request);
        })
    });
}

function update(request) {
    return caches.open(cacheName).then(function(cache) {
        return fetch(request).then(function(response) {
            return cache.put(request, response);
        });
    });
}