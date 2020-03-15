# Have you seen this gheist?
This is a test and documentation on how well Google understands the hashbang `!#` links used on this site, and how good the page can be found using Google Search.

## 2020-03-15
The Google Search coverage updated again, and now also contains the formerly missing `md2html` as `https://gheist.de/?_escaped_fragment_=/playground/md2html/`. The coverage now contains 9 urls (same as on 2020-03-08 + `md2html`).

*Observation:* All urls are somehow listed as "indexed, not sent by sitemap"

### Conclusions
1. Using `#!` prevents the crawler from finding the linked content
1. Providing `#!` urls in a sitemap works, but only for the provided links

====

## 2020-03-08
The Google Search coverage finaly updated on 2020-03-07 again, and now lists 8 pages as indexed:
```
https://gheist.de/
https://gheist.de/qr/
https://gheist.de/?_escaped_fragment_=/playground/
https://gheist.de/?_escaped_fragment_=/playground/mailscrambler/
https://gheist.de/?_escaped_fragment_=/playground/kanjiland/
https://gheist.de/?_escaped_fragment_=/playground/staticbgheading/
https://gheist.de/?_escaped_fragment_=/pixel/
https://gheist.de/#!/playground/staticbgheading/
```
This means now 5 of the 6 urls from the sitemap are indexed, missing is `https://gheist.de/#!/playground/md2html/`.

Notice how the `#!` seems to show up as `?_escaped_fragment_=`, and yet there is one `#!` in the list (`staticbgheading` is indexed twice). A quick search found me a [AJAX FAQ](https://support.google.com/webmasters/answer/174993) in Google's Search Console Help - which contradicts the [other Google help page](https://developers.google.com/search/mobile-sites/mobile-first-indexing#mobile-url-anchor-fragment) I found earlier.

====

## 2020-02-29
The Google Search coverage is still not updated from 2020-02-26, but searching for `site:gheist.de` now yields new results:
- the first page of `gheist.de`, with all the rotating keywords (unchanged)
- qr ghost, which is available by a regular url  on `/qr` (unchanged)
- link to `https://gheist.de/#!/pixel/` -> this one was manually requested
- link to `https://gheist.de/#!/playground/` -> from sitemap
- link to `https://gheist.de/#!/playground/kanjiland/`-> from sitemap

All new links have the matching preview text of the pages they link to.

*Observation:* The links of the sitemap started showing up on 2020-02-28. However, on 28th the search result yielded the link to the mail scrambler instead of kanjiland.

-> waiting for new update of search coverage.

====

## 2020-02-27
Sitemap indeed seems to be checked once per day. However, coverage in Search Console is only updated every few days.

Reported coverage as of 2020-02-26: same as on 2020-02-23. Most recent crawl on 2020-02-24.

The pages from the sitemap are **not indexed**. As it turns out in the [documentation](https://developers.google.com/search/mobile-sites/mobile-first-indexing#mobile-url-anchor-fragment), Google's mobile-first crawler does not index urls with anchor fragments (`#`). 
And as it seems from the test with the sitemap, these urls are completely ignored even when explicitely given.
----
Using the url checker of the Search Console for `https://gheist.de/#!/pixel/` shows the page is not indexed -> manually requesting indexing for this url.

The Search Console tests whether the url can be indexed and does not report an error, but shows a success message that the indexing has been requested.
We will have to wait and see, whether the url will be actually indexed.

====

## 2020-02-24
Sitemap was checked and an error was reported by Google -> checked once per day?

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
    - 31 crawling anomalies: these are all urls of the previous page version that no longer exist, like `http://gheist.de/blog/` or `http://gheist.de/journey/`. Most recent crawled at 2020-01-16.
    - 12 duplicates without canonical: again, all urls of the previous version, e.g. `http://gheist.de/projects/9/yesno/`. Most recent crawled at 2019-02-01.
    - 3 not found (404): again, all urls of the previous version. Most recent crawled at 2020-02-19.
    - 2 with redirects: `http://gheist.de` and `http://www.gheist.de`. This is most likely because `https` is now enforced.
    - 1 crawled but not indexed: `http://gheist.de/gh/news/page2.html`. Not really sure whether this was ever a valid url.

> Side note: There is a certificate warning when accessing `www.gheist.de` instead of `gheist.de`. This is a known and open issue with [github pages](https://github.com/isaacs/github/issues/1675).

----

### Attempted Measures: sitemap.xml
It seems the Google Crawler ignores all `#!` urls, probably because of the regular `#` link semantic (for those who don't know this: a `#` link usually jumps to an element on the current page, but does not change the page content). Since all internal links use the `#!`, the crawler can't find anything further than the first page.

As an attempt to overcome this problem, I will provide Google with a sitemap. The sitemap contains an explicit number of urls for the crawler to visit. In this first step, I will point to the following site:

```
https://gheist.de/
https://gheist.de/#!/playground/
https://gheist.de/#!/playground/kanjiland/
https://gheist.de/#!/playground/staticbgheading/
https://gheist.de/#!/playground/md2html/
https://gheist.de/#!/playground/mailscrambler/
```
I will manually ping the sitemap to Google once it is uploaded.

The sitemap covers most of the playground. The interesting part will be kanjiland, because the `#!/playground/kanjiland/` contains further sub-pages. This will test the following questions:
- Does the crawler index a `#!` url if it is explicitely given?
- Does the crawler, once he knows that `#!` urls are used, stop ignoring them?

**Update 14:20**: Pinged sitemap to Google. Also, certificate issue on `www.gheist.de` seems to be resolved, after removing the `CNAME` entry on the DNS server and re-adding it (`CNAME` for `www.gheist.de` to `gheist.de`).

====

## 2020-02-22
Searching for `site:gheist.de` returns 2 results:
- the first page of `gheist.de`, with all the rotating keywords
- qr ghost, which is available by a regular url  on `/qr`

No other pages are listed, this means that none of the hashbang links were followed!
Note that there is no link referencing the qr ghost url, even the privacy url in the playstore is a hashbang ur pointing to `https://gheist.de/#!qr/privacy.md`.

To better understand how Google indexes this website, I have enabled the Google Search Console for `gheist.de`. Unfortunately, it tells me to check back tomorrow as the data is still being processed.

Update after ~8 hours: still no data available, using url checker shows that `https://gheist.de` is indexed without sitemap and without referencing pages. Google says 'url might be known from other sources not listed'.