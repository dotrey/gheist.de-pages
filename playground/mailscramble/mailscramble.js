var scrambler = (function(my) {

    my.options = {
        reorder : true,
        invertedDirection : "rtl",
        rtlReplacements : {
            "(" : ")",
            ")" : "(",
            "<" : ">",
            ">" : "<",
            "[" : "]",
            "]" : "[",
            "}" : "{",
            "{" : "}",
        },
        nonsense : true,
        sparseNonsense : true,
        nonsenseAlphabet : "abcdefghijklmnopqrstuvwxyz1234567890-.@"
    }

    my.scramble = function(input, options) {
        options = options || {};
        Object.keys(my.options).forEach(function(key){
            options[key] = typeof options[key] !== "undefined" ? options[key] : my.options[key];
        });

        var parts = input.split("");
        var spans = createVisibleSpans(parts);

        if (options.reorder) {
            spans = reorderSpans(spans, options);
        }

        if (options.nonsense) {
            spans = injectNonsense(spans, options);
        }

        return html(spans, options);
    }

    var html = function(spans, options) {
        var style = "position:relative;display:inline-block;";
        if (options.reorder) {
            style += "direction:" + options.invertedDirection + ";";
            style += "user-select:none;";
        }
        var r = "<span style=\"" + style + "\">";
        for (var i = 0, ic = spans.length; i < ic; i++) {
            r += spans[i].html();
        }
        r += "</span>";
        return r;
    }

    /**
     * This adds various invisible spans with random values from the
     * nonsenseAlphabet provided in the options
     * @param array spans 
     * @paras {*} options
     */
    var injectNonsense = function(spans, options) {
        var styles = [
            null,
            {"float":"right"},
            {"float":"left"}
        ]

        var bloated = [];
        bloated.push(createSpan(
            randomArrayValue(options.nonsenseAlphabet),
            false,
            randomArrayValue(styles)
        ));
        for(var i = 0, ic = spans.length; i < ic; i++) {
            bloated.push(spans[i]);
            if (options.sparseNonsense && Math.random() < 0.5) {
                continue;
            }
            bloated.push(createSpan(
                randomArrayValue(options.nonsenseAlphabet),
                false,
                randomArrayValue(styles)
            ));
        }


        return bloated;
    }

    /**
     * This changes the order of the spans inside the code, while
     * keeping the visual order intact.
     * IMPORTANT: When trying to select and copy the visually correct
     * value, the copied value will be the code-order and thus mixed
     * up!
     * Note that some characters like braces will be replaced by the
     * browser with their respective counter parts and thus need to be
     * replaced beforehand, so it shows up correct after the browser
     * replaced them.
     * @param array spans 
     */
    var reorderSpans = function(spans, options) {
        var left = [];
        var right = [];
        var middle = [];

        for (var i = 0, ic = spans.length; i < ic; i++) {
            if (typeof options.rtlReplacements[spans[i].value] !== "undefined") {
                spans[i].value = options.rtlReplacements[spans[i].value];
            }
        }

        if (spans.length < 3) {
            // with less than 3 characters there is not much to reorder
            middle = spans;
        }else{
            var third = Math.floor(spans.length / 3);
            for(var i = 0; i < third; i++) {
                // take the first and last span but keep order
                left.push(spans.shift());
                right.unshift(spans.pop());
            }
            // the remaining spans are the middle part
            middle = spans;
        }

        var reordered = [];
        // we provide the spans from the right with a float:right to visually
        // move them to the right, but insert them first (code-wise left)
        while(right.length) {
            var s = right.pop();
            s.styles["float"] = "right";
            reordered.push(s);
        }
        // now take the left part, provide it with a float:left and add to
        // the code-wise middle
        while(left.length) {
            var s = left.shift();
            s.styles["float"] = "left";
            reordered.push(s);
        }
        // we now insert the middle part, but in reversed order as the parent
        // will reverse direction with rtl
        // Note: explicit display:inline-block required for this to work
        while(middle.length) {
            var s = middle.pop();
            s.styles["display"] = "inline-block";
            reordered.push(s);
        }

        return reordered
    }

    var createVisibleSpans = function(parts) {
        var spans = [];
        for(var i = 0, ic = parts.length; i < ic; i++) {
            spans.push(createSpan(parts[i], true))
        }
        return spans;
    }

    var createSpan = function(value, visible, styles) {
        if (value === " ") {
            // preserve spaces
            value = "&nbsp;";
        }
        return {
            value : value,
            visible : !!visible,
            styles : styles || [],

            html : function() {
                if (!this.visible) {
                    this.styles["display"] = "none";
                }
                var style = "";
                var keys = Object.keys(this.styles);
                for(var i = 0, ic = keys.length; i < ic; i++) {
                    style += keys[i] + ":" + this.styles[keys[i]] + ";"
                }
                return "<span style=\"" + style + "\">" + this.value + "</span>";
            }
        }
    }

    var randomArrayValue = function(values) {
        var i = Math.floor(Math.random() * values.length);
        return values[i];
    }

    return my;
})(scrambler || {});