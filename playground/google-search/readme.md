# Have you seen this gheist?
This is a test and documentation on how well Google understands the hashbang `!#` links used on this site, and how good the page can be found using Google Search.

====

## 2020-02-23
Searching for `site:gheist.de` still returns the same 2 results as on 2020-02-22.

The Search Console now has data ready and reports a coverage of:
- 0 errors
- 0 warnings
- 2 valid, as expected:
    - `https://gheist.de`
    - `https://gheist.de/qr/`
- 49 excluded:
    - 31 crawling anomalies: these are all URLs of the previous page version that no longer exist, like `http://gheist.de/blog/` or `http://gheist.de/journey/`. Most recent crawled at 2020-01-16.
    - 12 duplicates without canonical: again, all URLs of the previous version, e.g. `http://gheist.de/projects/9/yesno/`. Most recent crawled at 2019-02-01.
    - 3 not found (404): again, all URLs of the previous version. Most recent crawled at 2020-02-19.
    - 2 with redirects: `http://gheist.de` and `http://www.gheist.de`. This is most likely because `https` is now enforced.
    - 1 crawled but not indexed: `http://gheist.de/gh/news/page2.html`. Not really sure whether this was ever a valid URL.

> Side note: There is a certificate warning when accessing `www.gheist.de` instead of `gheist.de`. This is a known and open issue with [github pages](https://github.com/isaacs/github/issues/1675).

----

### Attempted Measures: sitemap.xml
It seems the Google Crawler ignores all `#!` URLs, probably because of the regular `#` link semantic (for those who don't know this: a `#` link usually jumps to an element on the current page, but does not change the page content). Since all internal links use the `#!`, the crawler can't find anything further than the first page.

As an attempt to overcome this problem, I will provide Google with a sitemap. The sitemap contains an explicit number of URLs for the crawler to visit. In this first step, I will point to the following site:

```
https://gheist.de/
https://gheist.de/#!/playground/
https://gheist.de/#!/playground/kanjiland/
https://gheist.de/#!/playground/staticbgheading/
https://gheist.de/#!/playground/md2html/
https://gheist.de/#!/playground/mailscambler/
```
I will manually ping the sitemap to Google once it is uploaded.

The sitemap covers most of the playground. The interesting part will be kanjiland, because the `#!/playground/kanjiland/` contains further sub-pages. This will test the following questions:
- Does the crawler index a `#!` URL if it is explicitely given?
- Does the crawler, once he knows that `#!` URLs are used, stop ignoring them?


====

## 2020-02-22
Searching for `site:gheist.de` returns 2 results:
- the first page of `gheist.de`, with all the rotating keywords
- qr ghost, which is available by a regular url  on `/qr`

No other pages are listed, this means that none of the hashbang links were followed!
Note that there is no link referencing the qr ghost url, even the privacy url in the playstore is a hashbang ur pointing to `https://gheist.de/#!qr/privacy.md`.

To better understand how Google indexes this website, I have enabled the Google Search Console for `gheist.de`. Unfortunately, it tells me to check back tomorrow as the data is still being processed.

Update after ~8 hours: still no data available, using url checker shows that `https://gheist.de` is indexed without sitemap and without referencing pages. Google says 'URL might be known from other sources not listed'.