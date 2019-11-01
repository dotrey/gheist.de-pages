var glitch = (function(g) {

    g.intensity = 0.1;

    g.infect = function() {
        var p = document.getElementsByTagName("p");
        for(var i = 0, ic = p.length; i < ic; i++) {
            this.infectText(p[i]);
        }
        var h1 = document.getElementsByTagName("h1");
        for(var i = 0, ic = h1.length; i < ic; i++) {
            this.infectText(h1[i]);
        }
        var h2 = document.getElementsByTagName("h2");
        for(var i = 0, ic = h2.length; i < ic; i++) {
            this.infectText(h2[i]);
        }
        var h3 = document.getElementsByTagName("h3");
        for(var i = 0, ic = h3.length; i < ic; i++) {
            this.infectText(h3[i]);
        }
    };

    g.infectText = function(origin) {
        if (typeof origin.glitch !== "undefined") {
            return;
        }

        var glitched = document.createElement(origin.tagName);
        glitched.innerHTML = origin.innerHTML;
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

            x : origin.offsetTop,
            y : origin.offsetLeft,
            dx : 0,
            dy : 0,
            opacity : 0.5,

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
            },

            reset : function() {
                glitched.style.display = "none";
                origin.style.opacity = "initial";
            },

            disturb : function() {
                if (!this.active) {
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
    }

    return g;
})(glitch || {});