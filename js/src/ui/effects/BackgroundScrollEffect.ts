import { Kidoo, Occurrence } from "kidoo";
import { Effect } from "../Effect";

export class BackgroundScrollEffect extends Occurrence implements Effect {

    constructor(private kidoo: Kidoo) {
        super(0, Number.MAX_SAFE_INTEGER);
    }

    apply(_route: string): void {
        this.kidoo.addOccurrence(this);
    }

    remove(): void {
        this.kidoo.removeOccurrence(this);
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

    private reset() {
        document.body.style.setProperty("--bg-offset-x", "0");
        document.body.style.setProperty("--bg-offset-y", "0");
    }

    private updateProgress() {
        let y: number = -this.currentGlobalTick / 100;
        document.body.style.setProperty("--bg-offset-y", "" + y);
    }
}