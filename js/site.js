var site = (function(my) {
    my.version = "0.2.0";
    my.debug = true;

    my.config = {
        md2htmlWorker : null,
        rotationInterval : 5000,
        rotationRandom : false,
        lazyImageObserver : null
    };

    /* navigation and content */

    my.onHashChange = function() {
        this.log(window.location.hash);
        var hash = window.location.hash || "#!/";
        hash = hash.substr(1);
        var parts = hash.split("|");
        for(var i = 0, ic = parts.length; i < ic; i++) {
            if (parts[i][0] === "!") {
                // navigation request
                this.navigate(parts[i].substr(1));
            }
        }
    };

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
        this.ajax(loc + this.noCache()).done(function(data) {
            this.displayContent(data);
        }.bind(this));
    }

    my.displayContent = function(md) {
        this.config.md2htmlWorker.postMessage(md);
    }

    my.setContent = function(html) {
        this.e("#content").innerHTML = html;
        this.injectImageLazyLoading();
    }

    /* image enlargment and lazy loading */

    my.injectImageLazyLoading = function() {
        var images = this.e("#content .img");
        if (this.config.lazyImageObserver === null &&
            typeof IntersectionObserver !== "undefined") {
            var options = {
                root: null,
                rootMargin: '0px',
                threshold: 0
            }

            this.config.lazyImageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.backgroundImage = "url('" + entry.target.getAttribute("data-src") + "')";
                        observer.unobserve(entry.target);
                    }
                });
            }.bind(this), options);
        }
        for (var i = 0, ic = images.length; i < ic; i++) {
            if (this.config.lazyImageObserver) {
                this.config.lazyImageObserver.observe(images[i]);
            }else{
                // no intersection observer available,
                // directly show the images
                images[i].style.backgroundImage = "url('" + images[i].getAttribute("data-src") + "')";
            }
        }
    }

    my.enlargeImage = function(element) {
        var l = document.createElement("div");
        l.setAttribute("class", "large");
        l.setAttribute("title", element.getAttribute("title"));
        l.onclick = function(event) {
            event.stopPropagation();
            event.preventDefault();
            l.parentNode.removeChild(l);
        }
        element.appendChild(l);
        return false;
    }

    /* main page subtitle rotator */

    my.rotate = function() {
        if (this.e("#content").innerHTML) {
            return;
        }

        var container = this.e("#logo-rotator");
        var current = 0;
        for (var i = 0, ic = container.children.length; i < ic; i++) {
            if (container.children[i].getAttribute("class") === "visible") {
                current = i;
            }
            container.children[i].setAttribute("class", "");
        }
        var next = (current + 1) % ic;
        if (this.config.rotationRandom ) {
            do {
                next = Math.floor(ic * Math.random());
            }while(next === current);
        } 
        container.children[next].setAttribute("class", "visible");
    }

    /* setup */

    my.initialize = function() {
        this.setupMd2Html();
        window.addEventListener("hashchange", this.onHashChange.bind(this), true);
        this.log("initialized site v" + this.version);
        this.onHashChange();

        window.setInterval(this.rotate.bind(this), this.config.rotationInterval);
    }

    my.setupMd2Html = function() {
        this.log("setup md2html")
        if (window.Worker) {
            this.config.md2htmlWorker = new Worker("/js/md2html-worker.js");
            this.config.md2htmlWorker.onmessage = function(e) {
                this.setContent(e.data);
            }.bind(this);
            this.log(".. worker created");
        }else{
            this.log(".. worker unavailable, using fallback");
            var e = document.createElement("script");
            e.src = "/playground/md2html/md2html.js";
            document.head.appendChild(e);
            this.config.md2htmlWorker = {
                postMessage : function(md) {
                    if (typeof md2html !== "undefined") {
                        md = md2html.html(md)
                    }
                    return md;
                }
            }
        }
    }

    /* utility */

    my.ajax = function(url, method, data) {
        method = (method || "get").toUpperCase();
        data = data || null;
        var ajax = {
            ax : null,
            isDone : false,
            isFailed : false,
            doneHandlers : [],
            failHandlers : [],
            successData : null,
            failData : null,

            send : function() {
                this.ax = new XMLHttpRequest();
                this.ax.addEventListener("load", function() {
                    if (this.ax.status === 200) {
                        this.onDone(this.ax.responseText);
                    }else{
                        this.onFail(this.ax.status);
                    }
                }.bind(this));
                if (data) {
                    this.ax.setRequestHeader("Content-Type", "application/json");
                    data = JSON.stringify(data);
                }
                this.ax.open(method, url, true);
                this.ax.send(data);
            },

            done : function(callback) {
                if (typeof callback !== "function") {
                    return this;
                }

                if (this.isDone) {
                    callback(this.successData);
                }else{
                    this.doneHandlers.push(callback);
                }
                return this;
            },

            onDone : function(responseData) {
                this.isDone = true;
                this.successData = responseData;
                for (var i = 0, ic = this.doneHandlers.length; i < ic; i++) {
                    this.doneHandlers[i](responseData);
                }
            },

            fail : function(callback) {
                if (typeof callback !== "function") {
                    return this;
                }

                if (this.isFailed) {
                    callback(this.failData);
                }else{
                    this.failHandlers.push(callback);
                }
                return this;
            },

            onFail : function(responseState) {
                this.isFailed = true;
                this.failData = responseState
                for (var i = 0, ic = this.failHandlers.length; i < ic; i++) {
                    this.failHandlers[i](responseState);
                }
            },
        }
        ajax.send();
        return ajax;
    }

    my.e = function(selector, parent) {
        selector = ("" + selector).trim();
        parent = parent || document;

        if (selector.indexOf(" ") > 0) {
            var tmp = selector.split(" ");
            parent = this.e(tmp.shift(), parent);
            return this.e(tmp.join(" "), parent);
        }

        if (selector.substr(0, 1) === "#") {
            return parent.getElementById(selector.substr(1));
        }else if (selector.substr(0, 1) === "."){
            return parent.getElementsByClassName(selector.substr(1));
        }else{
            return parent.getElementsByClassName(selector);
        }
    }

    my.noCache = function() {
        return "?nc=" + Date.now();
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