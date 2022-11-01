import { Kidoo, Occurrence } from "kidoo";
import { Effect } from "../Effect";

export class BackgroundScrollEffect extends Occurrence implements Effect {

    private orientationX: number = 0;
    private orientationY: number = 0;

    constructor(private kidoo: Kidoo) {
        super(0, Number.MAX_SAFE_INTEGER);
    }

    apply(_route: string): void {
        this.kidoo.addOccurrence(this);
        window.addEventListener("deviceorientation", this.handleOrientation.bind(this), true);
    }

    remove(): void {
        this.kidoo.removeOccurrence(this);
        window.removeEventListener("deviceorientation", this.handleOrientation);
        this.reset();
    }

    onactivate(): void {
        this.updateProgress();
    }

    ondeactivate(): void {
        this.updateProgress();
    }

    ontick(_tick: number, _globalTick: number): void {
        this.updateProgress();
    }

    private handleOrientation(event: DeviceOrientationEvent) {
        this.orientationX = (event.gamma ?? 0) / 90;
        this.orientationY = (event.beta ?? 0) / 180;
        this.updateProgress();
    }

    private reset() {
        document.body.style.setProperty("--bg-offset-x", "0");
        document.body.style.setProperty("--bg-offset-y", "0");
    }

    private updateProgress() {
        let y: number = this.orientationY - this.currentGlobalTick / 100;
        let x: number = this.orientationX;
        document.body.style.setProperty("--bg-offset-x", "" + x);
        document.body.style.setProperty("--bg-offset-y", "" + y);
    }
}