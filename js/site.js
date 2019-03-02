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
        }
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