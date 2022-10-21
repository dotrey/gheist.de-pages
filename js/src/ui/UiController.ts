import { Kidoo } from "kidoo";
import { EffectRouter } from "./EffectRouter";
import { LogoScrollEffect } from "./effects/LogoScrollEffect";

export class UiController {

    private effects: EffectRouter = new EffectRouter();
    private kidoo: Kidoo = new Kidoo();

    initialize() {
        this.createEffects();
        window.addEventListener("scroll", () => {
            this.kidooTick();
        });
        let isResizing: boolean = false;
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

    handleNavigated(route: string) {
        this.effects.apply(route);
        this.kidooTick();
    }

    private kidooTick() {
        this.kidoo.tick(Math.fround((window.scrollY / window.innerHeight) * 1000));
    }

    private createEffects() {
        this.effects.addRoute("^/$", new LogoScrollEffect(this.kidoo));
    }
}