export default class TouchHandler {
    constructor(element, options = {}) {
        this.element = element;
        this.cssTouchDown = "touched-down";
        this.cssTouchUp = "touched-up";
        this.cssTouchMove = "touched-move";
        this.touchLimit = 1;
        this.cancelTouchUpAfterMove = true;
        this.cancelTouchUpThreshold = 5;
        this.ongoingTouches = [];
        this.applyOptions(options);
        this.attach();
    }
    attach() {
        this.element.addEventListener("touchstart", this.handleTouchStart.bind(this));
        this.element.addEventListener("touchmove", this.handleTouchMove.bind(this));
        this.element.addEventListener("touchend", this.handleTouchEnd.bind(this));
        this.element.addEventListener("touchcancel", this.handleTouchEnd.bind(this));
    }
    handleTouchStart(e) {
        e.preventDefault();
        if (this.ongoingTouches.length >= this.touchLimit) {
            return;
        }
        for (let touch of e.changedTouches) {
            this.ongoingTouches.push(this.copyTouch(touch));
        }
        if (this.ongoingTouches.length) {
            this.element.classList.add(this.cssTouchDown);
            this.element.classList.remove(this.cssTouchUp);
        }
        if (typeof this.onTouchDown === "function") {
            this.onTouchDown(this.element);
        }
    }
    handleTouchMove(e) {
        e.preventDefault();
        for (let touch of e.changedTouches) {
            let i = this.ongoingTouchIndex(touch);
            if (i >= 0) {
                let oldTouch = this.ongoingTouches[i];
                let dx = touch.pageX - oldTouch.pageX;
                let dy = touch.pageY - oldTouch.pageY;
                if (typeof this.onTouchMove === "function") {
                    if (this.onTouchMove(this.element, dx, dy)) {
                        this.ongoingTouches.splice(i, 1);
                    }
                }
            }
        }
    }
    handleTouchEnd(e) {
        e.preventDefault();
        for (let touch of e.changedTouches) {
            let i = this.ongoingTouchIndex(touch);
            if (i > -1) {
                let oldTouch = this.ongoingTouches.splice(i, 1)[0];
                if (this.cancelTouchUpAfterMove) {
                    let dx = touch.pageX - oldTouch.pageX;
                    let dy = touch.pageY - oldTouch.pageY;
                    if (dx * dx + dy * dy >= this.cancelTouchUpThreshold * this.cancelTouchUpThreshold) {
                        continue;
                    }
                }
                if (typeof this.onTouchUp === "function") {
                    this.onTouchUp(this.element);
                }
            }
        }
        if (!this.ongoingTouches.length) {
            this.element.classList.remove(this.cssTouchDown);
            this.element.classList.add(this.cssTouchUp);
        }
    }
    copyTouch(touch) {
        return new Touch(touch);
    }
    ongoingTouchIndex(touch) {
        for (let i = 0, ic = this.ongoingTouches.length; i < ic; i++) {
            if (this.ongoingTouches[i].identifier === touch.identifier) {
                return i;
            }
        }
        return -1;
    }
    applyOptions(options) {
        this.cssTouchDown = options["cssTouchDown"] || this.cssTouchDown;
        this.cssTouchUp = options["cssTouchUp"] || this.cssTouchUp;
        this.cssTouchMove = options["cssTouchMove"] || this.cssTouchMove;
        this.cancelTouchUpAfterMove = typeof options["cancelTouchUpAfterMove"] !== "undefined" ?
            !!options["cancelTouchUpAfterMove"] :
            this.cancelTouchUpAfterMove;
        this.cancelTouchUpThreshold = options["cancelTouchUpThreshold"] || this.cancelTouchUpThreshold;
        this.onTouchDown = options["onTouchDown"] || null;
        this.onTouchUp = options["onTouchUp"] || null;
        this.onTouchMove = options["onTouchMove"] || null;
    }
}
//# sourceMappingURL=TouchHandler.js.map