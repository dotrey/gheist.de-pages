var glitch = (function(g) {

    g.active = true;
    g.intensity = 0.0001;
    g.increase = 0.0001;
    g.indicator = null;
    g.interval = null;

    g.infect = function(hasContent) {
        this.updateIndicator();
        this.infectLogo(hasContent);
        this.infectNav();
        this.infectBody();

        var p = document.getElementsByTagName("p");
        for(var i = 0, ic = p.length; i < ic; i++) {
            this.infectText(p[i]);
        }
        var h1 = document.getElementsByTagName("h1");
        for(var i = 0, ic = h1.length; i < ic; i++) {
            this.infectText(h1[i], {
                rgbThreshold : 0.75
            });
        }
        var h2 = document.getElementsByTagName("h2");
        for(var i = 0, ic = h2.length; i < ic; i++) {
            this.infectText(h2[i], {
                rgbThreshold : 0.75
            });
        }
        var h3 = document.getElementsByTagName("h3");
        for(var i = 0, ic = h3.length; i < ic; i++) {
            this.infectText(h3[i], {
                rgbThreshold : 0.75
            });
        }
    };

    g.updateIndicator = function() {
        if (!this.indicator) {
            this.indicator = document.createElement("span");
            this.indicator.style.fontFamily = "Roboto Mono Regular";
            this.indicator.style.position = "absolute";
            this.indicator.style.fontSize = "0.6em";
            this.indicator.style.top = "1em";
            this.indicator.style.left = "1em";
            this.indicator.style.lineHeight = "0.8";
            document.body.appendChild(this.indicator);
            this.interval = window.setInterval(function() {
                this.intensity += this.increase;
                if (this.intensity > 1) {
                    this.intensity = 1;
                    window.clearInterval(this.interval);
                }
                this.updateIndicator();
            }.bind(this), 33);
        }

        if (this.intensity < 1) {
            var v = Math.floor(this.intensity * 100);
            var d = Math.floor(this.intensity * 10000) - v * 100;
            var p = "";
            var tmp = v;
            while(tmp >= 20) {
                p += "=";
                tmp -= 20;
            }
            while (tmp >= 10) {
                p += "-";
                tmp -= 10;
            }
            if (v < 10) {
                v = "0" + v;
            }
            if (d < 10) {
                d = "0" + d;
            }
            var s = v + "." + d;
            this.indicator.innerHTML = s + "<br/>" + p;
        }else{
            this.indicator.innerHTML = "!100!<br/>=====";
        }
    }

    g.infectText = function(origin, opts) {
        if (typeof origin.glitch !== "undefined" || !origin.offsetParent) {
            return;
        }

        opts = opts || {};

        var glitched = document.createElement(origin.tagName);
        glitched.innerHTML = opts.customText || origin.innerHTML;
        glitched.style.position = "absolute";
        glitched.style.margin = 0;
        glitched.style.display = "none";
        origin.offsetParent.appendChild(glitched);
        
        var glitch = g.createGlitch();
        glitch.rgbThreshold = opts.rgbThreshold || 1;
        glitch.rgb = [];

        glitch.x = origin.offsetTop;
        glitch.y = origin.offsetLeft;
        glitch.dx = 0;
        glitch.dy = 0;
        glitch.opacity = 0.5;

        glitch.clearRgb = function() {
            if (this.rgb.length) {
                for (var i = 0; i < 3; i++) {
                    if (this.rgb[i].parentElement) {
                        this.rgb[i].parentElement.removeChild(this.rgb[i]);
                    }
                }
                glitched.innerHTML = opts.customText || origin.innerHTML;
                glitched.style.color = "";
            }
        }.bind(glitch);

        glitch.createRgb = function() {
            if (this.rgb.length) {
                return;
            }

            var color = [
                "rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)"
            ];

            for (var i = 0; i < 3; i++) {
                var t = document.createElement("span");
                t.innerHTML = opts.customText || origin.innerHTML;
                t.style.color = color[i];
                t.style.display = "block";   
                t.style.position = "absolute";
                t.style.top = 0;
                t.style.left = 0;
                t.style.width = "100%";
                t.style.opacity = 0.25;          
                glitched.appendChild(t);
                this.rgb.push(t);
            }
        }.bind(glitch);

        glitch.randomize = function() {
            var jitter = 10 * (1 + g.intensity);
            this.dx = (Math.random() * jitter * 2) - jitter;
            this.dy = (Math.random() * jitter * 2) - jitter;
            this.opacity = Math.min(1, Math.max(0, 0.2 + (0.8 * g.intensity * Math.random())));
        }.bind(glitch);

        glitch.update = function() {
            this.randomize();
            glitched.style.top = (this.x + this.dx) + "px";
            glitched.style.left = (this.y + this.dy) + "px";
            glitched.style.opacity = this.opacity;
            origin.style.opacity = 1 - this.opacity;
            if (g.intensity <= this.rgbThreshold) {
                this.clearRgb();
            }else{
                this.createRgb();
                this.rgb[0].style.left = this.dx * 0.5 + "px";
                this.rgb[0].style.top = -this.dy * 0.5 + "px";
                this.rgb[1].style.left = -this.dx + "px";
                this.rgb[1].style.top = -this.dy + "px";
                this.rgb[2].style.left = this.dx + "px";
                this.rgb[2].style.top = this.dy + "px";
                for (var i = 0; i < 3; i++) {
                    if (Math.random() > 0.5) {
                        this.rgb[i].style.display = "block";
                    }else{
                        this.rgb[i].style.display = "none";
                    }
                }
            }
        }.bind(glitch);

        glitch.reset = function() {
            this.loop = -1;
            glitched.style.display = "none";
            origin.style.opacity = "initial";
        }.bind(glitch);

        glitch.prepare = function() {
            glitched.style.display = "block";            
            this.loop = this.limit * g.intensity + 3;
        }.bind(glitch);
        
        origin.glitch = glitch;
        glitch.disturb();

        return glitch;
    }

    g.infectTextContent = function(origin) {
        if (typeof origin.glitch !== "undefined" ||
            !origin.innerText) {
            return;
        }

        var glitch = g.createGlitch();
        glitch.originalString = origin.innerText;
        glitch.parts = 0;
        
        glitch.prepare = function() {
            this.loop = 3;
            this.delay = 100 + Math.floor(g.intensity * 100) + 100 * Math.random();
            this.parts = Math.min(5, Math.floor(g.intensity * 10));
        }.bind(glitch);

        glitch.reset = function() {
            origin.innerHTML = this.originalString;
            this.loop = -1;
        }.bind(glitch);

        glitch.update = function() {
            if (this.parts > 1) {
                var len = Math.ceil(this.originalString.length / this.parts);
                var tmp = this.originalString;
                var ps = [];
                while (tmp.length >= len) {
                    ps.push(tmp.substr(0, len));
                    tmp = tmp.substr(len);
                }
                ps.push(tmp);
                for (var i = ps.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var x = ps[i];
                    ps[i] = ps[j];
                    ps[j] = x;
                }
                origin.innerHTML = ps.join("");
            }
        }.bind(glitch);
        origin.glitch = glitch;
        glitch.disturb();
    }

    g.infectLogo = function(hasContent) {
        var gheist = document.querySelector(".logo-gheist");
        var de = document.querySelector(".logo-de");
        var rotator = document.getElementById("logo-rotator");
        if (!gheist || !de || !rotator) {
            return;
        }

        gheist = gheist.firstElementChild;
        de = de.firstElementChild;

        if (typeof gheist.glitch !== "undefined") {
            if (hasContent) {
                gheist.glitch.pause();
            }else{
                gheist.glitch.play();
            }
            return;
        }

        gheist.glitch = {
            originalString : "gheistde",
            glitchedString : "glitched",
            origins : [],
            rotator : [],

            setup : function() {
                gheist.innerHTML = "";
                for (var i = 0; i < 6; i++) {
                    var s = document.createElement("span");
                    s.innerHTML = this.originalString[i];
                    gheist.appendChild(s);
                    this.origins[i] = s;
                }
                de.innerHTML = "";
                for (var i = 6; i < 8; i++) {
                    var s = document.createElement("span");
                    s.innerHTML = this.originalString[i];
                    de.appendChild(s);
                    this.origins[i] = s;
                }

                for (var i = 0; i < 8; i++) {
                    g.infectText(this.origins[i], {
                        customText : this.glitchedString[i], 
                        rgbThreshold : 0.75
                    });
                }

                this.rotator = rotator.childNodes;
                for (var i = 0, ic = this.rotator.length; i < ic; i++) {
                    g.infectTextContent(this.rotator[i]);
                }
            },

            pause : function() {
                if (typeof this.origins[0].glitch === "undefined") {
                    this.setup();
                }
                for (var i = 0; i < 8; i++) {
                    if (typeof this.origins[i].glitch !== "undefined") {
                        this.origins[i].glitch.active = false;
                    }
                }
                for (var i = 0, ic = this.rotator.length; i < ic; i++) {
                    if (typeof this.rotator[i].glitch !== "undefined") {
                        this.rotator[i].glitch.active = false;
                    }
                }
            },

            play : function() {
                if (typeof this.origins[0].glitch === "undefined") {
                    this.setup();
                }
                for (var i = 0; i < 8; i++) {
                    if (typeof this.origins[i].glitch !== "undefined") {
                        this.origins[i].glitch.active = true;
                        this.origins[i].glitch.disturb();
                    }
                }
                for (var i = 0, ic = this.rotator.length; i < ic; i++) {
                    if (typeof this.rotator[i].glitch !== "undefined") {
                        this.rotator[i].glitch.active = true;
                        this.rotator[i].glitch.disturb();
                    }
                }
            }
        }

        gheist.glitch.setup();
    }

    g.infectNav = function() {
        var gh = document.querySelector(".gh.logo-gh");
        if (!gh || typeof gh.glitch !== "undefined") {
            return;
        }

        var nav = document.querySelector("nav.links");
        var a = nav.getElementsByTagName("a");
        for(var i = 0, ic = a.length; i < ic; i++) {
            this.infectTextContent(a[i]);
        }

        var dupe = function(top) {
            var comp = getComputedStyle(gh);
            var e = document.createElement("div");
            e.innerHTML = gh.innerHTML;
            e.setAttribute("data-group", gh.getAttribute("data-group"));
            e.setAttribute("class", "gh");
            e.style.position = "absolute";
            e.style.left = 0;
            if (top) {
                e.style.top = 0;
            }else{
                e.style.bottom = 0;
            }
            e.style.width = "100%";
            e.style.height = gh.offsetHeight + "px";

            var c = document.createElement("div");
            c.setAttribute("class", gh.getAttribute("class"));
            c.style.pointerEvents = "none";
            c.style.overflow = "hidden";
            c.style.position = "absolute";
            c.style.display = "none";
            if (top) {
                if (comp.position === "absolute") {
                    c.style.top = "1em";
                }else{
                    c.style.top = 0;
                }
            }else{
                if (comp.position === "absolute") {
                    c.setAttribute("data-mobile", 1);
                    c.style.top = (gh.offsetHeight + gh.offsetTop) + "px";
                }else{
                    c.style.bottom = "calc(100% - " + (gh.offsetHeight + gh.offsetTop) + "px)";
                }
            }
            c.style.right = 0;
            c.style.zIndex = 11;
            c.appendChild(e);
            gh.offsetParent.appendChild(c);
            return c;
        };

        var injectBlocker = function(top) {
            var b = document.createElement("div");
            b.style.width = "100%";
            b.style.position = "absolute";
            if (top) {
                b.style.top = 0;
            }else{
                b.style.bottom = 0;
            }
            b.style.left = 0;
            b.style.backgroundColor = "inherit";
            b.style.zIndex = 11;
            gh.appendChild(b);
            return b;
        }

        var glitch = g.createGlitch();
        glitch.split = [
            dupe(true),
            dupe(false)
        ];
        glitch.blocker = [
            injectBlocker(true),
            injectBlocker(false),
        ];
        glitch.dx = [0, 0];
        glitch.h = [0, 0];

        glitch.reset = function() {
            this.loop = -1;
            gh.style.transform = "";
            for (var i = 0; i < 2; i++) {
                this.split[i].style.display = "none";
                this.split[i].style.height = 0;
                this.blocker[i].style.display = "none";
                this.blocker[i].style.height = 0;
            }
            this.h = [0, 0];
            this.dx = [0, 0];
        }.bind(glitch);

        glitch.prepare = function() {
            this.loop = 5;
            if (g.intensity > 0.66) {
                this.h = [
                    0.1 + 0.3 * Math.random(),
                    0.1 + 0.3 * Math.random()
                ];
                this.dx = [
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ];
                
                this.split[0].style.display = "block";                
                this.split[1].style.display = "block";
                this.blocker[0].style.display = "block";                
                this.blocker[1].style.display = "block";
            }else if (g.intensity > 0.33) {
                this.h = [
                    0.1 + 0.8 * Math.random(),
                    0
                ];
                this.dx = [
                    (Math.random() - 0.5) * 2,
                    0
                ];
                
                this.split[0].style.display = "block";    
                this.blocker[0].style.display = "block"; 
            }
        }.bind(glitch);

        glitch.update = function() {
            for (var i = 0; i < 2; i++) {
                var h = gh.offsetHeight * this.h[i];
                this.split[i].style.height = h + "px";
                this.split[i].style.right = this.dx[i] + "em";
                if (this.split[i].getAttribute("data-mobile")) {                    
                    this.split[i].style.top = (gh.offsetHeight + gh.offsetTop - h) + "px";
                }
                this.blocker[i].style.height = h + "px";
            }
        }.bind(glitch);

        gh.glitch = glitch;
        glitch.disturb();
    }

    g.infectBody = function() {
        if (typeof document.body.glitch !== "undefined") {
            return;
        }

        var createBar = function() {
            var bar = document.createElement("div");
            bar.style.position = "fixed";
            bar.style.width = "100%";
            bar.style.display = "none";
            bar.style.backgroundColor = "#000000";
            bar.style.pointerEvents = "none";
            bar.style.zIndex = 99;
            document.body.appendChild(bar);

            var y = 0;
            var dy = 0;
            var height = 0;
            var maxHeight = 25;

            var glitch = g.createGlitch();
            glitch.prepare = function() {
                this.loop = Math.floor(g.intensity * 10)
                height = 1 + Math.random() * g.intensity * maxHeight;
                y = Math.random() * (100 - height);
                
                bar.style.height = height + "vh";
                bar.style.display = "block";
                if (g.intensity > 0.8) {
                    var r = Math.random();
                    if (r < 0.25) {                        
                        bar.style.backgroundColor = "#000000";
                        bar.style.mixBlendMode = "initial";
                    }else if (r < 0.5) {                        
                        bar.style.backgroundColor = "#330000";
                        bar.style.mixBlendMode = "difference";
                    }else if (r < 0.75) {                        
                        bar.style.backgroundColor = "#003300";
                        bar.style.mixBlendMode = "difference";
                    }else {                        
                        bar.style.backgroundColor = "#000033";
                        bar.style.mixBlendMode = "difference";
                    }
                }
            }.bind(glitch);

            glitch.reset = function() {
                this.loop = -1;
                bar.style.display = "none";
                bar.style.backgroundColor = "#000000";
                bar.style.mixBlendMode = "initial";
            }.bind(glitch);

            glitch.update = function() {
                var jitter = 1 + g.intensity;
                dy = (Math.random() * jitter * 2) - jitter;
                if (dy + y + height > 100) {
                    dy = 100 - y - height;
                }
                bar.style.top = y + "vh";
                bar.style.opacity = Math.min(1, Math.max(0, 0.2 + (0.3 * g.intensity * Math.random())));
            }.bind(glitch);

            glitch.destroy = function() {
                document.body.removeChild(bar);
            }

            bar.glitch = glitch;
            glitch.disturb();
            return glitch;
        }

        var bars = [];
        var glitch = g.createGlitch();
        glitch.prepare = function() {
            // determine max number of bars
            var max = 0;
            if (g.intensity >= 0.5) {
                max = Math.floor(g.intensity * 5 * Math.random()) + 5;
            }

            // reduce if necessary...
            while(bars.length > max) {
                var b = bars.pop();
                b.destroy();
            }

            // ... or add if required
            while (bars.length < max) {
                bars.push(createBar());
            }

        }.bind(glitch);
        document.body.glitch = glitch;
        glitch.disturb();
    }

    /**
     * Creates the frame for a glitch, containing the logic to
     * disturb within specific times (depending on global intensity)
     * and the stub functions to overwrite with custom logic
     */
    g.createGlitch = function() {
        return {
            active : true,
            limit : 25,
            loop : -1,
            delay : 5,
            sleep : 500,
            maxSleep : 10000,

            update : function() {
                // implement custom logic
            },

            prepare : function() {
                // implement custom logic
            },

            reset : function() {
                // implement custom logic
            },

            disturb : function() {
                if (!g.active || !this.active) {
                    this.reset();
                    return;
                }
                if (this.loop < 0) {
                    this.reset();
                    window.setTimeout(function() {
                        this.prepare();
                        this.disturb();
                    }.bind(this), Math.min(this.maxSleep, this.sleep / g.intensity + (Math.random() * this.sleep / g.intensity)));
                    return;
                }

                this.update();
                this.loop--;
                window.setTimeout(function() {
                    this.disturb();
                }.bind(this), this.delay);
            }
        };
    }

    if (typeof site !== "undefined") {
        site.on("content", function(html) {
            g.infect(!!html);
        });
        site.on("navigate", function(location) {
            var jump = Math.floor(Math.random() * 50) / 1000;
            g.intensity = Math.min(1, g.intensity + jump);
        })
    }

    return g;
})(glitch || {});
console.log("for the glory of mankind");