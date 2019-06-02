# Changing Background-Color for Headings

This is just a quick test for my wife's website, how to give a heading linear gradient as background that "changes" color when scrolling.
After playing around with `::before` a bit, the answer was way simpler than I first thought:

*Update 02.06.2019:* Turns out it the easy solution was a bit too good to be true - this does not work for chromium based browsers on Android 
devices, due to an old performance tweak (see [chromium issue 521555](https://bugs.chromium.org/p/chromium/issues/detail?id=521555)).

```
h1 {
    position: relative;
    display: inline-block;
    padding: 0 0.25em;
    background: linear-gradient(180deg, red, blue);
    background-attachment: fixed;
    background-size: 100% 100vh;
}
```

Try scrolling the example:
[[[/playground/staticbgheading/]]]