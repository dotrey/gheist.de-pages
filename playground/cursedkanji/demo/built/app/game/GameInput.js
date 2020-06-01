import TouchHandler from "../../touched/TouchHandler.js";
import m from "../ui/Mithril.js";
export default class GameInput {
    constructor() {
        this.proposedText = "";
        this.maxTextLength = 24;
    }
    registerRomajiProposal(id) {
        let romajiProposal = document.getElementById(id);
        if (!romajiProposal) {
            return;
        }
        this.registerClearProposal(romajiProposal);
        this.registerUndoProposal(romajiProposal);
    }
    registerClearProposal(container) {
        let touchOptions = {
            onTouchUp: (e) => {
                this.clearProposal();
                m.redraw();
            }
        };
        for (let key of container.querySelectorAll(".romaji-proposal-clear")) {
            new TouchHandler(key, touchOptions);
        }
    }
    registerUndoProposal(container) {
        let touchOptions = {
            onTouchUp: (e) => {
                this.undoPropose();
                m.redraw();
            }
        };
        for (let key of container.querySelectorAll(".romaji-proposal-undo")) {
            new TouchHandler(key, touchOptions);
        }
    }
    registerRomajiBoard(id) {
        let romajiBoard = document.getElementById(id);
        if (!romajiBoard) {
            return;
        }
        this.registerKeys(romajiBoard);
        this.registerScrollRow(romajiBoard);
    }
    registerKeys(container) {
        let touchOptions = {
            onTouchUp: (e) => {
                this.propose(e.getAttribute("data-key") || "");
                m.redraw();
            }
        };
        for (let key of container.querySelectorAll(".romajiboard-key")) {
            new TouchHandler(key, touchOptions);
        }
    }
    registerScrollRow(container) {
        let touchOptions = {
            cancelTouchUpAfterMove: false,
            onTouchMove: (e, dx, dy) => {
                dx *= -1;
                let snap = parseInt(e.getAttribute("data-scrollsnap") || "0");
                let panelWidth = e.firstElementChild.offsetWidth;
                e.scrollLeft = Math.max(0, snap * panelWidth + dx);
                let scrollPercentage = Math.abs(dx / panelWidth);
                if (scrollPercentage >= 0.25) {
                    if (dx > 0) {
                        snap++;
                    }
                    else {
                        snap--;
                    }
                    snap = Math.max(0, Math.min(e.childElementCount - 1, snap));
                    e.setAttribute("data-scrollsnap", "" + snap);
                    this.scrollTo(e, snap * panelWidth);
                    return true;
                }
                return false;
            },
            onTouchUp: (e) => {
                let snap = parseInt(e.getAttribute("data-scrollsnap") || "0");
                let panelWidth = e.firstElementChild.offsetWidth;
                this.scrollTo(e, snap * panelWidth);
            }
        };
        for (let row of container.querySelectorAll(".romajiboard-scrollrow[data-scrollable]")) {
            new TouchHandler(row, touchOptions);
        }
    }
    clearScrollTimeout(e) {
        let timeout = e.getAttribute("data-scroll-timeout");
        if (timeout) {
            window.clearTimeout(parseInt(timeout));
            e.setAttribute("data-scroll-timeout", "");
        }
    }
    scrollTo(e, target, speed = 10, delay = 5) {
        this.clearScrollTimeout(e);
        this._scrollTo(e, target, speed, delay);
    }
    _scrollTo(e, target, speed = 10, delay = 5) {
        let x = e.scrollLeft;
        e.setAttribute("data-scroll-timeout", "");
        if (Math.abs(target - x) < speed) {
            e.scrollLeft = target;
            this.clearScrollTimeout(e);
        }
        else {
            if (x > target) {
                x -= speed;
            }
            else {
                x += speed;
            }
            e.scrollLeft = x;
            e.setAttribute("data-scroll-timeout", "" + window.setTimeout(() => {
                this._scrollTo(e, target, speed, delay);
            }, delay));
        }
    }
    propose(key) {
        if (this.proposedText.length >= this.maxTextLength) {
            return;
        }
        this.proposedText += key;
    }
    clearProposal() {
        this.proposedText = "";
    }
    undoPropose() {
        if (this.proposedText.length) {
            this.proposedText = this.proposedText.substr(0, this.proposedText.length - 1);
        }
    }
}
//# sourceMappingURL=GameInput.js.map