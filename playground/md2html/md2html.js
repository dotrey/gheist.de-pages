var md2html = (function(my){

    my.html = function(md) {
        var blocks = this.parse(md);
        return this.convert(blocks);
    }

    my.parse = function(md) {
        var blocks = [];
        var lines = md.split("\n");
        var lastBlock = null;
        for (var i = 0, ic = lines.length; i < ic; i++) {
            var line = lines[i];
            if (line.indexOf("#") === 0) {
                // heading
                lastBlock = this.createBlock("heading", null);
                lastBlock.appendLine(line);
                blocks.push(lastBlock);
            }else if (!line.trim()) {
                // empty line
                lastBlock = null;
            }else{
                // regular line, add to last paragraph
                if (!lastBlock || lastBlock.type !== "paragraph") {
                    lastBlock = this.createBlock("paragraph", null);
                    blocks.push(lastBlock);
                }
                lastBlock.appendLine(line);
            }
        }

        return blocks;
    }

    my.convert = function(blocks) {
        var result = "";

        for (var i = 0, ic = blocks.length; i < ic; i++) {
            result += this.converter.convert(blocks[i]) + "\n\n";
        }

        return result;
    }

    my.createBlock = function(type, parent) {
        return {
            type : type,
            lines : [],
            parent : parent,

            appendLine : function(line) {
                this.lines.push(line);
            },

            parseLines : function() {
                var ln = [];
                var lastBlock = null;
                for (var i = 0, ic = this.lines.length; i < ic; i++) {
                    if (typeof this.lines[i].type === "undefined") {
                        // this is a string
                        var trimmedLine = this.lines[i].trim();
                        if (trimmedLine.indexOf("```") === 0) {
                            // code block
                        }else if (trimmedLine.indexOf(" ") > 0) {
                            // line contains a space
                            var start = trimmedLine.split(" ", 2)[0];
                            switch(start) {
                                case ">":
                                    // blockquote
                                    if (!lastBlock || lastBlock.type !== "blockquote") {
                                        lastBlock = my.createBlock("blockquote", this);
                                        ln.push(lastBlock);
                                    }
                                    // cut off the "> "
                                    lastBlock.appendLine(trimmedLine.substr(2));
                                    break;
                                case "-":
                                case "*":
                                case "1.":
                                    // list
                                    var listType = start === "1." ? "orderedlist" : "unorderedlist"
                                    var indent = this.lines[i].indexOf(start);
                                    if (lastBlock && lastBlock.type === listType) {
                                        // the last block is of the same type as the current list
                                        // -> check indent
                                        if (lastBlock.indent === indent) {
                                            // same indent
                                            // -> row belongs to this list
                                            // cut off the list indicator and the following space
                                            lastBlock.appendLine(trimmedLine.substr(start.length + 1));
                                        }else{
                                            // different indent
                                            if (indent > lastBlock.indent) {
                                                // sublist
                                                var sublist = my.createBlock(listType, lastBlock);
                                                sublist.appendLine(trimmedLine.substr(start.length + 1));
                                                sublist.indent = indent;
                                                lastBlock.appendLine(sublist);
                                                lastBlock = sublist;
                                            }else{
                                                // we left the sublist and continue with the parent
                                                while (lastBlock.indent !== indent &&
                                                    lastBlock.parent) {
                                                    lastBlock = lastBlock.parent;
                                                }
                                                if (lastBlock.type === listType) {
                                                    // continue with the parent list
                                                    lastBlock.appendLine(trimmedLine.substr(start.length + 1));
                                                }else{
                                                    // create a new list
                                                    if (this === lastBlock) {
                                                        // new block inside the current block
                                                        lastBlock = my.createBlock(listType, this);
                                                        lastBlock.indent = indent;
                                                        ln.push(lastBlock);
                                                    }else{
                                                        // new block in a sub-block
                                                        var sublist = my.createBlock(listType, lastBlock.parent);
                                                        sublist.indent = indent;
                                                        lastBlock.parent.appendLine(sublist);
                                                        lastBlock = sublist;
                                                    }
                                                    lastBlock.appendLine(trimmedLine.substr(start.length + 1));
                                                }
                                            }
                                        }
                                    }else{       
                                        // create a completely new list                                 
                                        lastBlock = my.createBlock(listType, this);
                                        lastBlock.indent = indent;
                                        lastBlock.appendLine(trimmedLine.substr(start.length + 1));
                                        ln.push(lastBlock);
                                    }
                                    break;
                                default:
                                    // regular line
                                    if (lastBlock) {
                                        // previous lines belonged to a block
                                        // -> check whether the block has ended
                                        //    or the current line also belong to it
                                        if (lastBlock.type === "unorderedlist" ||
                                            lastBlock.type === "orderedlist" ||
                                            lastBlock.type === "blockquote") {
                                            // line no longer belongs to the block
                                            lastBlock = null;
                                            ln.push(this.lines[i]);
                                        }else{
                                            // code block
                                            // -> continues until next ```
                                            lastBlock.appendLine(this.lines[i]);
                                        }
                                    }else{
                                        // no open block
                                        ln.push(this.lines[i]);
                                    }
                                    break;
                            }
                        }
                    }else{
                        // this is actually another block
                    }
                }

                this.lines = ln;
            }
        }
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
            return "<h" + count + ">" + line.trim() + "</h" + count + ">";
        },

        paragraph : function(block) {
            var r = "<p>";

            // paragraph can contain sub-blocks
            block.parseLines();

            for (var i = 0, ic = block.lines.length; i < ic; i++) {
                if (typeof block.lines[i].type !== "undefined") {
                    // this is actually another block inside the paragraph
                    r += this.convert(block.lines[i]);
                }else{
                    // we re-add the line break to have a whitespace between
                    // consecutive lines and for the replacements, but it
                    // will be replaced by an actual <br/> later on
                    r += block.lines[i] + "\n";
                }
            }

            // inline repalcement here, to get multiline emphasis?
            r = my.inline.replace(r);

            r += "</p>";
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
                    r += "<li>" + block.lines[i] + "</li>";
                }
            }

            // inline repalcement here, to get multiline emphasis?
            r = my.inline.replace(r);

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
                    r += "<li>" + block.lines[i] + "</li>";
                }
            }

            // inline repalcement here, to get multiline emphasis?
            r = my.inline.replace(r);

            r += "</ul>";
            return r;
        },

        unknown : function(block) {
            return "<i>unknown block type: " + block.type + "</i>" + 
                this.paragraph(block);
        }
    }

    my.inline = {
        replace : function(string) {
            string = this.link(string);
            string = this.emphasis(string);
            string = this.inlineCode(string);
            string = this.nl2br(string);
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
                    value.replace("<", "&lt;").replace(">", "&gt;") +
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
        }
    }

    return my;
})(md2html || {});