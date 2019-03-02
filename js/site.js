var site = (function(my) {
    my.version = "0.1.0";
    my.debug = true;

    my.config = {

    };

    my.initialize = function() {
        this.log("initialized site v" + this.version);
    }

    my.navigate = function(loc) {
        if (!loc || loc === "/") {
            this.setContent("");
        }else{
            if (loc[loc.length - 1] === "/") {
                loc += "readme.md";
            }
            this.loadContent(loc);
        }
    }

    my.loadContent = function(loc) {
        var req = new XMLHttpRequest();
        req.addEventListener("load", function() {
            if (req.status === 200) {
                this.displayContent(req.responseText);
            }
        }.bind(this));
        req.open("GET", loc);
        req.send();
    }

    my.displayContent = function(md) {
        var content = md;
        if (typeof md2html !== "undefined") {
            content = md2html.html(md)
        }
        this.setContent(content);
    }

    my.setContent = function(html) {
        this.e("#content").innerHTML = html;
    }

    my.e = function(selector) {
        if (typeof selector.substr === "function" &&
            selector.length) {
            if (selector.substr(0, 1) === "#") {
                return document.getElementById(selector.substr(1));
            }else if (selector.substr(0, 1) === "."){
                return document.getElementsByClassName(selector.substr(1));
            }
        }
        return new HTMLCollection();
    }

    my.log = function(msg, o) {
        if (this.debug && console && console.log) {
            console.log("gh >> " + msg);
            if(o) {
                console.log(o);
            }
        }
    }
    
    return my;
})(site || {});
site.initialize();