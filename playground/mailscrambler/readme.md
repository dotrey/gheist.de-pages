# Mail Scrambler
The mail scrambler is an attempt to obfuscate an email address and hide it from all those
pesky webcrawlers out there, while still allowing a human to be able to recognize the
email address. The idea of this arose when I stumbled over a Facebook ad and how they
obfuscate the word "Advertisement" to prevent the ad from being filtered by an ad blocker.

The mail scrambler takes an email address (or any other string) and splits it into smaller
parts. The order of those smaller parts is altered in the HTML, resulting in some gibberish.
To make it readable (preferably only for humans), we add various CSS rules that alter the
order of the parts when rendered inside a browser, such that the gibberish resolves to
the actual email address again. This should prevent crawlers that only download and parse
the HTML from being able to extract the email address. Actually, even the `innerText` of
the DOM element containing the scrambled text resolves to the gibberish, thus even if the
crawler renders the website's HTML it would be non-trivial to search for the email address.

[[[/playground/mailscrambler/]]]{autosize}

## reorder
With the `reorder` option, the scrambler will mix up the order of the elements that
form the visible word inside the code, while the visible order of the elements remains
correct. So a word like "hello" will still look like "hello", but the elements in the
code might be ordered like "olleh".

The scrambler does so by first splitting the given string into three parts, like this:
```
"this is a text!" => "this " + "is a " + "text!"
```
The results are the `left`, `middle` and `right` part. To the `code`, we first add all
letters of the `right` with a `float:right`. The float value causes the element to show
up at the rightmost position, with the first element having this float-value being the
first element visible from the right, than the second element with `float:right`and so on.
This means we have to insert the right-most element first, thus effectively inserting them
in inverted order.

After this, we add the letters of `left` in a similar way, but with `float:left`. Here we
can keep the order of the elements, as the first `float:left` in code will also be the
first element visible from the right.

At last, we insert the middle part. We could keep the order of the elements, but this would
mean to keep the middle part easily readable. Instead, we insert the middle elements in 
reverse order and fix this visually by reversing the reading direction with `direction:rtl`.

> There was a funny effect if you try to use braces like (), [], {} or <>, as the `direction:rtl`
> will cause the browser to always display the opposite brace, resulting in things like
> `print)"hello world"(`. The `options` therefore now contain a `rtlReplacements` object that
> defines characters to be replaced when modifying the direction.

### reorder - Pros and Cons
Reordering the elements in code and using CSS to fix the visual result also alters the value
of the container's `innerText` to the mixed up value, and thus prevents reading the actual
value direct from the DOM tree.

Unfortunately, when a user tries to select and copy the text, he will copy the gibberish value
of the `innerText`. Because of this, the scrambler will automatically add a `user-select:none`
to the container (of course this can be bypassed, but it is a first indicator for the user that
copy might not work here).

The `float:left` and `float:right` elements also get messed up, if the container holding the
elements is to small and causes a line-break. This can't be fixed with a `white-space: nowrap`,
as the floats will then overlapp with the other text. The container therefore must be always
large enough to hold the complete content in one line.

## nonsense
With the `nonsense` option, the scrambler will add additional elements into the container, that
will not be visible to the user.

### nonsense - Pros and Cons
The added elements will make it a bit more difficult to retrieve the container's content by
stripping all HTML tags.

However, the invisible elements do not alter the container's `innerText` and are somewhat easy
to spot, if you take a look at the `style` attributes.

## Possible Improvements
The scrambler is far from perfect, especially with all those inline styles that can be parsed
with rather simple regular expressions. A better way would be the use of CSS classes with random
names. This would also open up the possibility to play around with CSS pseudo classes like 
`:nth-child()`, attribute and sibling selectors. All this would allow for far more complex rules
to rearrange and influence the visual order of the elements. Maybe vor v2?