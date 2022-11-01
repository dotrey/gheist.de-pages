(function () {
    'use strict';

    class Engine {
        constructor() {
            this.occurrences = [];
            this.activeOccurrences = [];
        }
        tick(globalTick) {
            let active = [];
            for (const occurrence of this.occurrences) {
                if (occurrence.active(globalTick)) {
                    if (this.activeOccurrences.indexOf(occurrence) < 0) {
                        occurrence.activate();
                    }
                    occurrence.tick(globalTick, globalTick);
                    active.push(occurrence);
                }
            }
            for (const previousActive of this.activeOccurrences) {
                if (active.indexOf(previousActive) < 0) {
                    previousActive.deactivate(globalTick, globalTick);
                }
            }
            this.activeOccurrences = active;
        }
        addOccurrence(occurrence) {
            if (this.occurrences.indexOf(occurrence) < 0) {
                this.occurrences.push(occurrence);
            }
        }
        removeOccurrence(occurrence) {
            let i = this.occurrences.indexOf(occurrence);
            if (i >= 0) {
                this.occurrences.splice(i, 1);
            }
        }
        resetOccurrences() {
            this.occurrences.length = 0;
        }
    }

    class Kidoo {
        constructor() {
            this.engine = new Engine();
        }
        tick(tick) {
            this.engine.tick(tick);
        }
        addOccurrence(occurrence) {
            this.engine.addOccurrence(occurrence);
        }
        removeOccurrence(occurrence) {
            this.engine.removeOccurrence(occurrence);
        }
        resetOccurrences() {
            this.engine.resetOccurrences();
        }
    }

    class Progress {
        constructor(occurrence) {
            this.occurrence = occurrence;
        }
        progressTick() {
            return Math.max(0, Math.min(this.occurrence.duration, this.occurrence.currentTick - this.occurrence.initialTick + 1));
        }
        linear() {
            return this.progressTick() / this.occurrence.duration;
        }
        ease() {
            return this.bezier(0.25, 0.1, 0.25, 1.0);
        }
        easeIn() {
            return this.bezier(0.42, 0.0, 1.0, 1.0);
        }
        easeOut() {
            return this.bezier(0.0, 0.0, 0.58, 1.0);
        }
        easeInOut() {
            return this.bezier(0.42, 0.0, 0.58, 1.0);
        }
        bezier(x1, y1, x2, y2) {
            let x = this.progressTick() / this.occurrence.duration;
            if (x <= 0) {
                return 0;
            }
            else if (x >= 1) {
                return 1;
            }
            let values = this.bezierCache(x1, y1, x2, y2);
            for (let i = 0; i < values.length; i++) {
                if (values[i].x >= x) {
                    if (i > 0) {
                        let fx = (x - values[i - 1].x) / (values[i].x - values[i - 1].x);
                        return values[i - 1].y + (values[i].y - values[i - 1].y) * fx;
                    }
                    else {
                        let fx = x / values[i].x;
                        return values[i].y * fx;
                    }
                }
            }
            let i = values.length - 1;
            let fx = (1 - x) / (1 - values[i].x);
            return values[i].y + (1 - values[i].y) * fx;
        }
        bezierCache(x1, y1, x2, y2) {
            let key = x1 + ":" + y1 + "|" + x2 + ":" + y2;
            if (typeof Progress.cache[key] === "undefined") {
                Progress.cache[key] = [];
                for (let t = 0; t <= 1; t += 1 / Progress.resolution) {
                    Progress.cache[key].push(this.cubicBezierCurve(t, x1, y1, x2, y2));
                }
            }
            return Progress.cache[key];
        }
        cubicBezierCurve(t, x1, y1, x2, y2) {
            let x3 = 1;
            let y3 = 1;
            return {
                x: 3 * t * Math.pow((1 - t), 2) * x1 + 3 * t * t * (1 - t) * x2 + Math.pow(t, 3) * x3,
                y: 3 * t * Math.pow((1 - t), 2) * y1 + 3 * t * t * (1 - t) * y2 + Math.pow(t, 3) * y3
            };
        }
    }
    Progress.cache = {};
    Progress.resolution = 1000;

    class Occurrence {
        constructor(initialTick = 0, duration = 0, ontick = null) {
            this.initialTick = 0;
            this.duration = 0;
            this.children = [];
            this.isActive = false;
            this.currentTick = -1;
            this.currentGlobalTick = -1;
            this.progress = new Progress(this);
            this.initialTick = initialTick;
            this.duration = duration;
            if (typeof ontick === "function") {
                this.ontick = ontick.bind(this);
            }
        }
        tick(tick, globalTick) {
            this.currentTick = tick;
            this.currentGlobalTick = globalTick;
            this.ontick(tick, globalTick);
            this.tickChildren(tick, globalTick);
        }
        ontick(tick, globalTick) {
        }
        active(tick) {
            return this.duration > 0 &&
                this.initialTick <= tick &&
                tick < this.initialTick + this.duration;
        }
        activate() {
            this.isActive = true;
            this.onactivate();
            for (const child of this.children) {
                child.activate();
            }
        }
        onactivate() {
        }
        deactivate(tick, globalTick) {
            this.currentTick = tick;
            this.currentGlobalTick = globalTick;
            this.isActive = false;
            this.ondeactivate();
            this.deactivateChildren(tick, globalTick);
        }
        ondeactivate() {
        }
        tickChildren(tick, globalTick) {
            let relativeTick = tick - this.initialTick;
            for (const child of this.children) {
                child.tick(relativeTick, globalTick);
            }
        }
        deactivateChildren(tick, globalTick) {
            let relativeTick = tick - this.initialTick;
            for (const child of this.children) {
                child.deactivate(relativeTick, globalTick);
            }
        }
    }

    class EffectRouter {
        constructor() {
            this.effects = {};
            this.activeEffects = [];
        }
        addRoute(route, effect) {
            if (typeof this.effects[route] === "undefined") {
                this.effects[route] = [];
            }
            this.effects[route].push(effect);
        }
        apply(currentRoute) {
            for (const effect of this.activeEffects) {
                effect.remove();
            }
            currentRoute = currentRoute || "/";
            for (const route in this.effects) {
                if (currentRoute.match(route)) {
                    for (let i = 0; i < this.effects[route].length; i++) {
                        if (typeof this.effects[route][i] === "function") {
                            this.effects[route][i] = this.effects[route][i]();
                        }
                        this.effects[route][i].apply(currentRoute);
                    }
                }
            }
        }
    }

    class BackgroundScrollEffect extends Occurrence {
        constructor(kidoo) {
            super(0, Number.MAX_SAFE_INTEGER);
            this.kidoo = kidoo;
            this.orientationX = 0;
            this.orientationY = 0;
        }
        apply(_route) {
            this.kidoo.addOccurrence(this);
            window.addEventListener("deviceorientation", this.handleOrientation.bind(this), true);
        }
        remove() {
            this.kidoo.removeOccurrence(this);
            window.removeEventListener("deviceorientation", this.handleOrientation);
            this.reset();
        }
        onactivate() {
            this.updateProgress();
        }
        ondeactivate() {
            this.updateProgress();
        }
        ontick(_tick, _globalTick) {
            this.updateProgress();
        }
        handleOrientation(event) {
            var _a, _b;
            this.orientationX = ((_a = event.gamma) !== null && _a !== void 0 ? _a : 0) / 90;
            this.orientationY = ((_b = event.beta) !== null && _b !== void 0 ? _b : 0) / 180;
            console.log(`orientation adjustment ${this.orientationX} - ${this.orientationY}`);
            this.updateProgress();
        }
        reset() {
            document.body.style.setProperty("--bg-offset-x", "0");
            document.body.style.setProperty("--bg-offset-y", "0");
        }
        updateProgress() {
            let y = this.orientationY - this.currentGlobalTick / 100;
            let x = this.orientationX;
            document.body.style.setProperty("--bg-offset-x", "" + x);
            document.body.style.setProperty("--bg-offset-y", "" + y);
        }
    }

    class LogoScrollEffect extends Occurrence {
        constructor(kidoo) {
            super(0, 500);
            this.kidoo = kidoo;
            this.nav = null;
            this.header = null;
        }
        apply(_route) {
            this.kidoo.addOccurrence(this);
        }
        remove() {
            this.kidoo.removeOccurrence(this);
            this.embedLogo();
        }
        onactivate() {
            console.log("activate");
            this.nav = document.querySelector("nav");
            this.header = document.querySelector("header");
            this.updateProgress();
        }
        ontick(_tick, _globalTick) {
            this.updateProgress();
        }
        ondeactivate() {
            this.updateProgress();
            console.log("deactivate");
        }
        updateProgress() {
            let p = this.progress.linear();
            if (window.scrollY === 0) {
                p = 0;
            }
            else if (!this.active) {
                p = 1;
            }
            if (p < 1) {
                if (this.nav) {
                    this.nav.classList.remove("logo-embedded");
                    this.nav.classList.add("logo-scrolling");
                    this.nav.setAttribute("style", "--scroll-progress: " + p);
                }
                if (this.header) {
                    this.header.classList.remove("logo-embedded");
                    this.header.classList.add("logo-scrolling");
                    this.header.setAttribute("style", "--scroll-progress: " + p);
                }
            }
            else {
                this.embedLogo();
            }
        }
        embedLogo() {
            if (this.nav) {
                this.nav.classList.add("logo-embedded");
                this.nav.classList.remove("logo-scrolling");
                this.nav.setAttribute("style", "");
            }
            if (this.header) {
                this.header.classList.add("logo-embedded");
                this.header.classList.remove("logo-scrolling");
                this.header.setAttribute("style", "");
            }
        }
    }

    class UiController {
        constructor() {
            this.effects = new EffectRouter();
            this.kidoo = new Kidoo();
        }
        initialize() {
            this.createEffects();
            window.addEventListener("scroll", () => {
                this.kidooTick();
            });
            let isResizing = false;
            window.addEventListener("resize", () => {
                if (isResizing) {
                    return;
                }
                requestAnimationFrame(() => {
                    this.kidooTick();
                    isResizing = false;
                });
                isResizing = true;
            });
        }
        handleNavigated(route) {
            this.effects.apply(route);
            this.kidooTick();
        }
        kidooTick() {
            this.kidoo.tick(Math.fround((window.scrollY / window.innerHeight) * 1000));
        }
        createEffects() {
            this.effects.addRoute("^/$", new LogoScrollEffect(this.kidoo));
            this.effects.addRoute(".*", new BackgroundScrollEffect(this.kidoo));
        }
    }

    class Logger {
        static log(msg, o = null) {
            if (this.isLogging) {
                console.log(msg);
                if (o) {
                    console.log(o);
                }
            }
        }
    }
    Logger.isLogging = false;
    function log(msg, o = null) {
        Logger.log(msg, o);
    }

    class Gheist {
        constructor() {
            this.version = "7.0";
            this.ui = new UiController();
        }
        initialize() {
            Logger.isLogging = true;
            this.ui.initialize();
            this.ui.handleNavigated(location.pathname);
            log(`initialized gheist v${this.version}`);
        }
    }

    let gheist = new Gheist();
    gheist.initialize();

})();
