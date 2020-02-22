var cacheName = "qr-ghost-cache-v0.9";
var cachedFiles = [
    "/qr/assets/css/style.css",
    "/qr/assets/font/Apache License.txt",
    "/qr/assets/font/OpenSans-Regular.ttf",
    "/qr/assets/font/RobotoMono-Regular.ttf",
    "/qr/assets/img/qr-ghost.png",
    "/qr/assets/img/icons/128-qr-ghost.png",
    "/qr/assets/img/icons/192-qr-ghost.png",
    "/qr/assets/img/icons/256-qr-ghost.png",
    "/qr/assets/img/icons/512-qr-ghost.png",
    "/qr/assets/img/video-poster.png",
    "/qr/assets/img/codes/aztec-code.gif",
    "/qr/assets/img/codes/barcode.gif",
    "/qr/assets/img/codes/data-matrix.gif",
    "/qr/assets/img/codes/micro-qr-code.gif",
    "/qr/assets/img/codes/qr-code-large.gif",
    "/qr/assets/img/codes/qr-code.gif",
    "/qr/assets/img/demo/qr-url.png",

    "/qr/built/BackStack.js",
    "/qr/built/qrGhost.js",
    "/qr/built/qrWrapper.js",
    "/qr/built/VideoHelper.js",

    "/qr/lib/jsQR/jsQR.js",
    "/qr/lib/qrWorker/qrWorker.js",

    "/qr/",
    "/qr/index.html"
]

self.addEventListener("install", function(e) {
    log("install");
    e.waitUntil(buildCache());
});

function buildCache() {
    return caches.open(cacheName).then(function(cache) {
        return cache.addAll(cachedFiles);
    });
}

self.addEventListener("fetch", function(e) {
    log("fetch " + e.request.url);
    e.respondWith(caches.match(e.request).then(function(response) {
        return response || fetch(e.request).then(function(response) {
            return caches.open(cacheName).then(function(cache) {
                log("caching new resource " + e.request.url);
                cache.put(e.request, response.clone());
                return response;
            });
        });
    }));
});

self.addEventListener("activate", function(e) {
    log("activate");
    e.waitUntil(caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
            if (key.indexOf("qr-ghost-cache") === 0 && key !== cacheName) {
                log("clearing old cache " + key)
                return caches.delete(key);
            }
        }));
    }));
});

function log(msg, o) {
    console.log("sw >> " + msg);
    if (o) {
        console.log(o);
    }
}