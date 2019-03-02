var md2html = (function(my) {

    my.settings = {
        // blocks that can stretch over multiple lines
        multilineBlocks : [
            "paragraph", "blockquote", "orderedlist", "unorderedlist", "codeblock"
        ],
        // blocks where indents have semantic value
        indentableBlocks : [
            "orderedlist", "unorderedlist"
        ]
    }

    my.html = function(md) {
        var blocks = this.parse(md);
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
            if (!blocks[i]) {
                // empty line will always trigger a new block
                lastBlock = null;
                continue;
            }
            if (!lastBlock) {
                lastBlock = blocks[i];
                merged.push(lastBlock);
            }else{
                if (lastBlock.type !== blocks[i].type) {
                    // different block type, start a new block
                    var newBlock = blocks[i];
                }else{

                }
            }
        }
        return merged;
    }

    my.createBlock = function(line, type, indent) {
        return {
            line : line,
            type : type,
            indent : indent,
            lines : [],
            parent : null,

            appendLine : function(line) {
                this.lines.push(line);
            },

            appendTo : function(parent) {
                this.parent = parent;
                parent.appendLine(this);
            }
        }
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
                default:
                    break;
            }
        }

        // some line contain start symbols without containing a space
        if (line.indexOf("```") === 0) {
            return "codeblock";
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

    return my;
})(md2html || {});