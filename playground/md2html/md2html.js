var md2html = (function(my) {

    my.settings = {
        // blocks that can stretch over multiple lines
        multilineBlocks : [
            "paragraph", "blockquote", "orderedlist", "unorderedlist"
        ],
        // blocks where indents have semantic value
        indentableBlocks : [
            "orderedlist", "unorderedlist"
        ],
        // blocks that can contain empty rows
        multiparagraphBlocks : [
            "codeblock"
        ],
        // block that neither contain formated text nor sub-blocks
        unformattedBlocks : [
            "codeblock"
        ]
    }

    my.html = function(md) {
        var blocks = this.parse(md);
        return this.convert(blocks);
    }

    my.parse = function(md) {
        var lines = md.split("\n");
        var blocks = [];
        for (var i = 0, ic = lines.length; i < ic; i++) {
            if (!lines[i].trim()) {
                // empty line
                blocks.push(null);
                continue;
            }
            var blocktype = this.detectBlockType(lines[i]);
            var indent = this.getIndent(lines[i]);
            blocks.push(this.createBlock(lines[i], blocktype, indent));
        }
        var mergedBlocks = this.mergeBlocks(blocks);
        return mergedBlocks;
    }

    my.mergeBlocks = function(blocks) {
        var merged = [];
        var lastBlock = null;
        for (var i = 0, ic = blocks.length; i < ic; i++) {
            if (lastBlock && !blocks[i]) {
                if (!this.isMultiParagraph(lastBlock)) {
                    // if the last block isn't a block that allows empty line,
                    // the empty line will always start a new block
                    lastBlock = null;
                }else{
                    // if the last block allows empty lines, we add one
                    lastBlock.appendLine("");
                }
                continue;
            }
            if (!lastBlock) {
                lastBlock = blocks[i];
                if (lastBlock) {
                    merged.push(lastBlock);
                }
            }else{
                if(this.isUnformatted(lastBlock)) {
                    // an unformatted block will capture all lines until a
                    // block with the same type is found, which closes the
                    // unformatted block
                    lastBlock.appendLine(blocks[i].line);
                    if (lastBlock.type === blocks[i].type) {
                        // close the unformatted block
                        lastBlock = null;
                    }
                    // continue with the next line
                    continue;
                }

                if (lastBlock.type !== blocks[i].type) {
                    // different block type, start a new block
                    if (!this.isIndentable(lastBlock) ||
                        !this.isIndentable(blocks[i])) {
                        // indent is not relevant for at least one of the blocks
                        // -> we create a new block
                        lastBlock = blocks[i];
                        merged.push(lastBlock);
                    }else{
                        // indent is relevant for both blocks
                        // -> both blocks must be lists
                        // -> find the parent
                        var newBlockParent = this.findParentBlock(lastBlock, blocks[i]);
                        if (newBlockParent && 
                            newBlockParent.type === blocks[i].type &&
                            newBlockParent.indent === blocks[i].indent) {
                            // continue with the last block's parent
                            lastBlock = newBlockParent;
                            lastBlock.appendLine(blocks[i].line);
                        }else{
                            // start new block
                            lastBlock = blocks[i];
                            lastBlock.appendTo(newBlockParent);
                            if (!newBlockParent) {
                                merged.push(lastBlock);
                            }
                        }
                    }
                }else{
                    // same block type
                    if (!this.isIndentable(lastBlock)) {
                        // if the indent has no relevance for the block,
                        // we can simply add the current block's line to
                        // the last block
                        lastBlock.appendLine(blocks[i].line);
                    }else{
                        // the indent is relevant
                        if (lastBlock.indent === blocks[i].indent) {
                            // same type and same indent
                            // -> continue last block
                            lastBlock.appendLine(blocks[i].line);
                        }else{
                            // same types but different indents
                            // -> search the new parent block
                            var newBlockParent = this.findParentBlock(lastBlock, blocks[i]);
                            if (newBlockParent && 
                                newBlockParent.type === blocks[i].type &&
                                newBlockParent.indent === blocks[i].indent) {
                                // continue with the last block's parent
                                lastBlock = newBlockParent;
                                lastBlock.appendLine(blocks[i].line);
                            }else{
                                // start new block
                                lastBlock = blocks[i];
                                lastBlock.appendTo(newBlockParent);
                                if (!newBlockParent) {
                                    merged.push(lastBlock);
                                }
                            }
                        }
                    }
                }
            }
        }
        return merged;
    }

    my.findParentBlock = function(oldBlock, newBlock) {
        if (oldBlock.indent < newBlock.indent) {
            // the new block is more indented than the old block
            // -> new block becomes sub-block of the old block
            return oldBlock;
        }else if (oldBlock.indent === newBlock.indent) {
            // both blocks have the same indent and thus share 
            // the parent, but if the have the same type we should
            // continue with the oldBlock instead of creating a 
            // new one
            if (oldBlock.type === newBlock.type) {
                return oldBlock;
            }
            return oldBlock.parent;
        }else{
            // the old block is more indented than the new block
            // -> we need to look at the parent of the old block
            //    and compare it's indent
            return this.findParentBlock(oldBlock.parent, newBlock);
        }
    }

    my.createBlock = function(line, type, indent) {
        return {
            line : line,
            type : type,
            indent : indent,
            lines : [line],
            parent : null,

            appendLine : function(line) {
                this.lines.push(line);
            },

            appendTo : function(parent) {
                this.parent = parent;
                if (parent) {
                    parent.appendLine(this);
                }
            }
        }
    }

    my.convert = function(blocks) {
        var result = "";

        for (var i = 0, ic = blocks.length; i < ic; i++) {
            result += this.converter.convert(blocks[i]) + "\n\n";
        }

        return result;
    }

    my.converter = {
        convert : function(block) {            
            if (typeof this[block.type] === "function") {
                return this[block.type](block)
            }else{
                this.unknown(block);
            }
        },

        heading : function(block) {
            var count = 0;
            var line = block.lines[0];
            while(line.length && line.indexOf("#") === 0) {
                count++;
                line = line.substr(1);
            }
            count = Math.min(Math.max(1, count), 6);
            line = my.inline.angleBrackets(line.trim());
            return "<h" + count + ">" + line + "</h" + count + ">";
        },

        paragraph : function(block) {
            var r = "<p>";

            for (var i = 0, ic = block.lines.length; i < ic; i++) {
                if (typeof block.lines[i].type !== "undefined") {
                    // this is actually another block inside the paragraph
                    r += this.convert(block.lines[i]);
                }else{
                    // we re-add the line break to have a whitespace between
                    // consecutive lines and for the replacements
                    r += my.inline.replace(block.lines[i]) + "\n";
                }
            }

            r += "</p>";
            return r;
        },

        blockquote : function(block) {
            var r = "<blockquote>";

            for (var i = 0, ic = block.lines.length; i < ic; i++) {
                if (typeof block.lines[i].type !== "undefined") {
                    // this is actually another block inside the paragraph
                    r += this.convert(block.lines[i]);
                }else{
                    // we re-add the line break to have a whitespace between
                    // consecutive lines and for the replacements
                    // remove the leading "> "
                    var line = block.lines[i].trim().substr(1).trim();
                    r += my.inline.replace(line) + "<br/>\n";
                }
            }

            r += "</blockquote>";
            return r;
        },

        codeblock : function(block) {
            var r = "";

            for (var i = 0, ic = block.lines.length; i < ic; i++) {
                if (block.lines[i].indexOf("```") === 0) {
                    // skip start and end line of the codeblock
                    continue;
                }
                // code blocks can't contain other blocks
                var line = my.inline.angleBrackets(block.lines[i]);
                line = my.inline.nbsp(line);
                r += "<li>" + line + "</li>\n";
            }
            
            r = "<ol class=\"codeblock\">" + r + "</ol>";
            return r;
        },

        orderedlist : function(block) {
            var r = "<ol>";

            for (var i = 0, ic = block.lines.length; i < ic; i++) {
                if (typeof block.lines[i].type !== "undefined") {
                    // this is actually another block inside the list
                    // -> belongs to the previous line
                    if (r.indexOf("</li>")) {
                        r = r.substr(0, r.lastIndexOf("</li>"));
                    }else{
                        r += "<li>";
                    }
                    r += this.convert(block.lines[i]) + "</li>";
                }else{
                    // single item
                    // remove the leading "1. "
                    var line = block.lines[i].trim().substr(2).trim();
                    r += "<li>" + my.inline.replace(line) + "</li>";
                }
            }

            r += "</ol>";
            return r;
        },

        unorderedlist : function(block) {
            var r = "<ul>";

            for (var i = 0, ic = block.lines.length; i < ic; i++) {
                if (typeof block.lines[i].type !== "undefined") {
                    // this is actually another block inside the list
                    // -> belongs to the previous line
                    if (r.indexOf("</li>")) {
                        r = r.substr(0, r.lastIndexOf("</li>"));
                    }else{
                        r += "<li>";
                    }
                    r += this.convert(block.lines[i]) + "</li>";
                }else{
                    // single item
                    // remove the leading "* " or "- "
                    var line = block.lines[i].trim().substr(1).trim();
                    r += "<li>" + my.inline.replace(line) + "</li>";
                }
            }

            r += "</ul>";
            return r;
        },

        horizontalline : function(block) {
            return "<hr/>";
        },

        horizontalbreak : function(block) {
            return "<hr class=\"horizontal-break\" />"
        },

        unknown : function(block) {
            return "<i>unknown block type: " + block.type + "</i>" + 
                this.paragraph(block);
        }
    }

    my.inline = {
        replace : function(string) {
            string = this.angleBrackets(string);
            // inline code will replace [ with the html entity, preventing further
            // replacements of [...] inside the inline code
            string = this.inlineCode(string);
            // since link with "[abc](http://...)" is close to image with "![abc](http://...)"
            // we have to replace image before link
            string = this.image(string);
            string = this.link(string);
            string = this.task(string);
            string = this.emphasis(string);
            return string;
        },

        task : function(string) {
            string = string.replace(/(^|\s)\[([ x~])\]\s/gm, "<span class=\"task\" data-value=\"$2\"></span>");

            return string;
        },

        image : function(string) {
            string = string.replace(/!\[([^\]]*?)\]\(([^)]*?)\)(\{([^}]*?)\})?/gm, "<div class=\"img $4\" style=\"background-image:url('$2');\" title=\"$1\" onclick=\"site.enlargeImage(this);\"></div>");

            return string;
        },

        link : function(string) {
            string = string.replace(/\[([^\]]*?)\]\(([^)]*?)\)/gm, "<a href=\"$2\">$1</a>");

            return string;
        },

        inlineCode : function(string) {
            function codeSpan(value) {
                value = value.substr(1, value.length - 2);
                return "<span class=\"inline-code\">" + 
                    value.replace("<", "&lt;").replace(">", "&gt;").replace("[", "&#91;") +
                    "</span>";
            }
            string = string.replace(/`[^`\n]+?`/gm, codeSpan);

            return string;
        },

        emphasis : function(string) {
            string = this.bold(string);
            string = this.italic(string);
            return string;
        },

        bold : function(string) {
            string = string.replace(/\*\*([\S].*[\S])\*\*/gm, "<b>$1</b>");
            string = string.replace(/__([\S].*[\S])__/gm, "<b>$1</b>");
            return string;
        },

        italic : function(string) {
            string = string.replace(/\*([^\s*].*[^\s*])\*/gm, "<i>$1</i>");
            string = string.replace(/_([^\s_].*[^\s_])_/gm, "<i>$1</i>");
            return string;
        },

        nl2br : function(string) {
            string = string.replace(/\n/gm, "<br/>");
            return string;
        },

        nbsp : function(string) {
            string = string.replace(/ /gm, "&nbsp;");
            return string;
        },

        angleBrackets : function(string) {
            string = string.replace(/</gm, "&lt;");
            string = string.replace(/>/gm, "&gt;");
            return string;
        },
    }

    my.detectBlockType = function(line) {
        line = (line || "").trim();
        if (line.indexOf(" ") > 0) {
            // line might contain a start symbol
            var start = line.split(" ", 2)[0];
            switch(start) {
                case "#":
                case "##":
                case "###":
                case "####":
                case "#####":
                case "######":
                    return "heading";
                case "*":
                case "-":
                    return "unorderedlist";
                case "1.":
                    return "orderedlist";
                case ">":
                    return "blockquote";
                case "```":
                    return "codeblock";
                case "----":
                    return "horizontalline";
                case "====":
                    return "horizontalbreak";
                default:
                    break;
            }
        }

        // some line contain start symbols without containing a space
        if (line.indexOf("```") === 0) {
            return "codeblock";
        }else if(line.indexOf("----") === 0) {
            return "horizontalline";
        }else if(line.indexOf("====") === 0) {
            return "horizontalbreak";
        }

        // everything that has no explicit block type could be a paragraph
        return "paragraph";
    }

    my.getIndent = function(line) {
        var i = 0;
        while(line.indexOf(" ") === 0) {
            i++;
            line = line.substr(1);
        }
        return i;
    }

    my.isIndentable = function(block) {
        return this.settings.indentableBlocks.indexOf(block.type) >= 0;
    }

    my.isMultiline = function(block) {
        return this.settings.multilineBlocks.indexOf(block.type) >= 0;
    }

    my.isMultiParagraph = function(block) {
        return this.settings.multiparagraphBlocks.indexOf(block.type) >= 0;
    }

    my.isUnformatted = function(block) {
        return this.settings.unformattedBlocks.indexOf(block.type) >= 0;
    }

    return my;
})(md2html || {});