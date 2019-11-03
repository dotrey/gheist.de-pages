var glitch = (function(g) {

    g.active = true;
    g.intensity = 0.0001;
    g.increase = 0.0001;
    g.indicator = null;
    g.interval = null;

    g.infect = function(hasContent) {
        this.updateIndicator();
        this.infectLogo(hasContent);

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
            }.bind(this), 100);
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
        
        origin.glitch = {
            active : true,
            limit : 50,
            loop : -1,
            delay : 5,
            sleep : 500,
            rgbThreshold : opts.rgbThreshold || 1,
            rgb : [],

            x : origin.offsetTop,
            y : origin.offsetLeft,
            dx : 0,
            dy : 0,
            opacity : 0.5,

            clearRgb : function() {
                if (this.rgb.length) {
                    for (var i = 0; i < 3; i++) {
                        if (this.rgb[i].parentElement) {
                            this.rgb[i].parentElement.removeChild(this.rgb[i]);
                        }
                    }
                    glitched.innerHTML = opts.customText || origin.innerHTML;
                    glitched.style.color = "";
                }
            },

            createRgb : function() {
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
            },

            randomize : function() {
                var jitter = 10 * (1 + g.intensity);
                this.dx = (Math.random() * jitter * 2) - jitter;
                this.dy = (Math.random() * jitter * 2) - jitter;
                this.opacity = Math.min(1, Math.max(0, 0.2 + (0.8 * g.intensity * Math.random())));
            },

            update : function() {
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
            },

            reset : function() {
                this.loop = -1;
                glitched.style.display = "none";
                origin.style.opacity = "initial";
            },

            disturb : function() {
                if (!g.active || !this.active) {
                    this.reset();
                    return;
                }
                if (this.loop < 0) {
                    this.reset();
                    window.setTimeout(function() {
                        glitched.style.display = "block";
                        this.loop = this.limit * g.intensity;
                        this.disturb();
                    }.bind(this), this.sleep / g.intensity + (Math.random() * this.sleep / g.intensity));
                    return;
                }

                this.randomize();
                this.update();
                this.loop--;
                window.setTimeout(function() {
                    this.disturb();
                }.bind(this), this.delay);
            }
        };

        origin.addEventListener("click", origin.glitch.disturb.bind(origin.glitch));
        origin.glitch.disturb();

        return origin.glitch;
    }

    g.infectLogo = function(hasContent) {
        var gheist = document.querySelector(".logo-gheist");
        var de = document.querySelector(".logo-de");
        if (!gheist || !de) {
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
            },

            pause : function() {
                if (typeof this.origins[0].glitch === "undefined") {
                    this.setup();
                }
                for (var i = 0; i < 8; i++) {
                    if (typeof this.origins[0].glitch !== "undefined") {
                        this.origins[i].glitch.active = false;
                    }
                }
            },

            play : function() {
                if (typeof this.origins[0].glitch === "undefined") {
                    this.setup();
                }
                for (var i = 0; i < 8; i++) {
                    if (typeof this.origins[0].glitch !== "undefined") {
                        this.origins[i].glitch.active = true;
                        this.origins[i].glitch.disturb();
                    }
                }
            }
        }

        gheist.glitch.setup();
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