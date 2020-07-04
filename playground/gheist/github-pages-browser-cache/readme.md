# GitHub Pages and the Browser Cache

GitHub Pages are great and a quick and easy way to quickly setup and host a website. There is, however, one problem: GH Pages by default tell the browser to cache a file for 10 minutes.

This probably is a tradeoff between not caching at all and preventing those annoying outdated-but-not-stale caches, where you have to force a refresh or wait for your cached version to expire.

You might wonder why you should even care about too short cache times, since it is GitHub's server that has to handle the requests. Thankfully, if there is a stale file in the cache, the browser doesn't directly request a new copy of the file. It first asks the server whether the file actually changed and only reloads the file if necessary.

But there is always the other, receiving side. And even though bandwidth and mobile data is becoming cheaper and the connections become faster, no network will beat the performance of loading a cached version. And, in my opinion, just because we can afford to waste this bandwidth, doesn't mean we shouldn't at least try to avoid wasting it.

There can be additional benefits gained by improving the caching -- like getting rid of an an unsightly font swap (you may have noticed that when initially loading gheist.de).

### Ok, what can be done to increase the cache time?

One way would be to modify the `cache-control: max-age=600` that the server sends with its response and is what tells the browser to cache the file, but after 10 minutes (600 seconds), the browser should check the server and see if the file has changed.

Since I can't modify the server, my idea was to use a service worker that acts as a proxy and modifies the response from the server, replacing `max-age=600` with `max-age=31536000` (1 year). 

Does it work? Well yes, but actually, no. When inspecting the network tab of the Chrome developer tools, you can see two requests: 1 from the style sheet to the service worker, and 1 from the service worker to the server. The service worker thus is acting as a proxy and catches the request, and it is even correctly modifying the response by setting the `max-age=31536000`.

But the browser doesn't care. The only request/response that gets cached is the one from the service worker to the server -- with `max-age=600`

On an interesting side note: modifying the `max-age` with the service worker allows you to fool the Lighthouse test built into the Chrome dev tools, for whatever reason you might need this…

### So, this was all in vain?

Maybe it wasn't. I tried modifying the response, which didn't work. But with the service worker I can also modify the request, and the request allows to set a [cache mode](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache). This can be set to `force-cache`, telling the browser to always serve the cached version (if there is one), regardless of how stale it might be. If there is no cached version, the browser will make a regular request to the server.

And does this work? After testing a bit, It seems to be working. The font file is added to the browser's cache on the first visit, and -- in contrast to all the other files put in the cache on the first visit -- when requested after the cache has expired, the service worker returns HTTP status 200 from disk cache. The other files cause a request to the server resulting in HTTP status 304 (not modified).

Keep in mind that this comes with the downside that if you actually want to update the file, you must either trigger a force refresh, rename the file or find another way around the `force-cache`.
