import { Kidoo, Occurrence } from "kidoo";
import { Effect } from "../Effect";

export class LogoScrollEffect extends Occurrence implements Effect {
    private nav: HTMLElement | null = null;
    private header: HTMLElement | null = null;

    constructor(private kidoo: Kidoo) {
        super(0, 500);
    }
    
    apply(_route: string): void {
        this.kidoo.addOccurrence(this);
    }

    remove(): void {
        this.kidoo.removeOccurrence(this);
        this.embedLogo();
    }

    onactivate(): void {
        console.log("activate");
        this.nav = document.querySelector("nav");
        this.header = document.querySelector("header");

        this.updateProgress();
    }

    ontick(_tick: number, _globalTick: number): void {
        this.updateProgress();
    }

    ondeactivate(): void {
        this.updateProgress();
        console.log("deactivate");
    }

    private updateProgress() {
        let p: number = this.progress.linear();
        if (window.scrollY === 0) {
            // at the top of the page
            p = 0;
        } else if (!this.active) {
            // deactivated while scrolling down
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
        } else {
            this.embedLogo();
        }
    }

    private embedLogo() {
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