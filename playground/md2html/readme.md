# Markdown to HTML
md2html.js is a lib with the intention to parse given markdown syntax and return
matching HTML. The HTML can be further styled using CSS, and some special cases
like code blocks require CSS to be distinguishable from the regular text. The
library will convert them into usable HTML elements with predefined classes.
Since this lib is intended to be used with github pages, it focuses on the Markdown
syntax as described here: https://guides.github.com/features/mastering-markdown/

# Supported Features
Based on the github Markdown syntax:
* [x] Headings
* [x] Paragraphs
* [x] Blockquotes
* [x] Ordered lists (with "1.")
* [x] Unordered lists (with "*" or "-")
* [x] Codeblocks
  * [x] Inline code
* [ ] Code highlighting for 
  * [ ] JavaScript
* [~] Emphasis
  * [x] bold
  * [x] italic
  * [ ] strike through
* [x] Links
  * [x] explicit links
  * [x] automatic url replacement
* [x] Images
  * [x] extended syntax `[title](http://){css classes}`
* [x] Tasks

Additional features:
* [ ] Forced `<br/>`
* [x] Horizontal line on `----`
* [x] Horizontal 'break' on `====`
* [ ] (nth) Annotations in `@class="abc"` style, allowing to set attributes on generated elements

Support for the following features is currently not planned:
* Tables

# Parsing
For parsing, the entire markdown is split into its lines. For each line is checked,
whether it is a special line like a heading, list, etc. and a new block is created
for every line with the matching block type. Normal lines are converted into paragraphs.
The following block types are available:
* `heading`
* `paragraph`
* `orderedlist`
* `unorderedlist`
* `blockquote`
* `codeblock`
Once all lines have been converted into blocks, this list of blocks is traversed and
adjacent blocks of the same types are merged into one larger block. For lists there is
the added complication of indents, which have to be respected together with the block
type when deciding whether to merge or to keep a block.
Indents are also used to determine the parent of a block, which might be another block.

Another special case are codeblocks, which are the only blocks that can contain empty
lines. For all other blocks, an empty line would trigger the start of a new block.

# Conversion
Once all blocks are merged, the blocks are rendered as HTML. This step is pretty straight
forward, as simply a surrounding HTML element is created for each block (like `<p></p>`
for paragraphs) and all line of the block are added to this element. If one line is not a
string but another block (e.g. for a nested list), the sub-block is rendered and then added
to the parent block's HTML.