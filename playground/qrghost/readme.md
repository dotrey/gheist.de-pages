# qr ghost
Late 2019, christmas is only a few days away. I'm presenting a new feature to one of my colleagues at work, which included a qr code with a url, so the user won't have to type in the url manually. We want to try it with my colleague's phone and have some vague memories of there being a qr code reader somewhere in the phone's default camera app. However, we can't find it, so we might remember the default app of another phone brand (yes, it's an Android phone). 

But not to worry, there sure is a qr code reader in the Google Play store. And well, there are many qr code reader apps. But finding one, that doesn't throw ads at you before giving even the chance to do anything else or requiring the most absurd permissions for scanning a qr code, proves to be difficult. We finally found one, but it took us longer than we thought -- and to be honest, we immediately deleted it after we had scanned the qr code.

## Christmas Project
After this, I discussed a bit with my colleague how hard it would be to create a simple qr code scanner that only does two things: scan a qr code and display what it did scan. And thus, this became my small christmas project for the lazy time between visiting relatives and eating too much.

Spoiler: I did finish the project, which you can find and try out here: [qr.gheist.de](https://qr.gheist.de)
![qr ghost logo](/playground/qrghost/img/qr-ghost.png)

I decided to try and create a web app with TypeScript and started to look for a TypeScript or JavaScript library to actually scan the qr codes. I usually like to deep-dive such topics, but with the self-imposed time limit, I decided to go the reasonable way. I soon found [jsQR (GitHub)](https://github.com/cozmo/jsQR), did some quick tests and went with it.

And by 25th december, I actually had a first version that would give you a live view of the phone's camera, scan a qr code and, if it did scan a link, even convert the result into a clickable link. For all other results, I added a copy-button.

I kept polishing it, and before the year ended it looked pretty much what I wanted it to be. Since it was all JavaScript, one could simply open it in the phone's browser, grant the camera permission and scan a qr code. Quick and simple.

## Android App
But what about the times when there was no internet? Yeah, they are rare, but why not simple wrap the already created web app into an app with a WebView, so it could be installed and used whenever and wherever a qr code showed up?

What sounded like a good plan turned out to be a major pain. The basic app with the WebView was quickly created, I had done this before, et voilà -- it was running on my phone. I proudly showed it to my wife and installed it on her phone and -- it broke. The live view of the camera was strangely zoomed in. After tinkering around a bit, I discovered that her phone with its four backward facing cameras did order them in a strange way. Camera 1 on the phone was not the "normal" camera, but the most zoomed in camera. Since my phone only has one backward facing camera, I never encountered the problem. But luckily, the cameras were always enumerated in the same order. So, I assumed, the "normal" camera is the last one. 

Well, you probably guessed it, I was wrong. My colleague's phone from the same manufacturer, but with one less camera, had the "normal" camera at another position of the enumeration. Since the app is limited to the data available to the WebView, there is no way to get more detailed information on the cameras, except for their ids and the labels, both generated by the browser.

And here the real problems started. I had added a camera selection for devices with multiple cameras, based on the information provided in the labels. Due to security concerns, the browsers provide no labels until the camera permission is granted by the user. With the WebView, you intercept this permission request in your surrounding code and auto-grant it. This works, but the WebView did not remember the granted permission. It was instantly re-granted by the app, but due to the permission-timing, I was unable to get any camera labels inside the WebView.

And worse, every time the permission was granted again, the WebView generated new ids for the cameras. This is a helpful feature to prevent browser fingerprinting, but made it impossible to manually select and change the camera. Why? To select a camera, I ask the browser to give me the stream of camera with id 1234. I got this id by enumerating the cameras of the device (which required permission that was auto-granted). Since the WebView "forgot" this permission, the request to get stream of camera 1234 triggers the permission request again. It is granted again, but now the browser generates new camera ids. The browser notes my request for camera 1234, but since this id no longer exists, the browser can't find it and returns a camera that best fits the rest of my camera-stream-request -- which usually is the camera we initially retrieved and just tried to change.

## Progressive Web App and Android App, the 2nd
Well, I spent a lot of time with the WebView approach until I finally scrapped it. But I still wanted an installable app that could be used without internet, and so I tried it with a progressive web app (PWA). Since I had already built a web app, all that was left was to add the "progressive" part. The "progressive" part refers to the optional ability to close the gap between a native app and a pure web app, if the browser supports it. And with Chromium, base for most default browsers on Android phones, everything I required was there.

The main thing my web app was missing was a `ServiceWorker`, that acts as a proxy between the web app and the server. This part essentially allows to download all the assets once and then serve them from a local cache. With the "Add to homescreen" function of e.g. Chrome I could already create something close to a normal app, as it would place a "link" to the website on the phone's homescreen, which nearly looks like a normal app icon (all with the web apps logo). Tapping on the icon still opens the browser, but thanks to the `ServiceWorker` the web app also works without internet.

Adding a manifest file indicates this offline-ability to the browsers, and most browsers will then display an "install qr ghost" bar when visiting the website. This is basically a larger and more prominent "Add to homescreen" button.

This was already pretty good, but I remembered reading about how PWAs could now be added to the play store. But of course, I couldn't find the article I had read a few months ago, and finding documentation on how to do this was more challenging than I thought. However, with the [right tutorial](https://developers.google.com/web/android/trusted-web-activity/quick-start), bundling the PWA into an Android app was actually quite simple. There are some caveats, because the PWA runs in a so called `Trusted Web Activity`, which requires at least Chrome v72, but on recent and/or regularly updated devices, this shouldn't be a problem. On the first launch of the app, it will display a "Opened in Chrome" (or similar) message. And lastly, if you use the app signing of Google Play, remember to also use the Google Play SHA256 certificate fingerprint when creating your digital asset link.

The Android app was mainly done because it is possible, and personally I prefer the PWA from the first link. But if you want to look at a PWA wrapped for the Play store, [here you go](https://play.google.com/store/apps/details?id=de.gheist.android.qrghost).