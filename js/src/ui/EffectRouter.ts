import { Effect } from "./Effect";

export class EffectRouter {
    private effects: { [route: string]: (Effect | (() => Effect))[] } = {};
    private activeEffects: Effect[] = [];
    
    /**
     * Adds an effect to a route. Can either be an instance of Effect or
     * a function that returns an instance of Effect.
     * If a function is given, it will be executed the first time its 
     * route becomes active, and the function will be replaced by its
     * returned value.
     * 
     * @param route 
     * @param effect 
     */
    addRoute(route: string, effect: Effect|(() => Effect)) {
        if (typeof this.effects[route] === "undefined") {
            this.effects[route] = [];
        }
        this.effects[route].push(effect);
    }

    /**
     * Removes all previously active effects before applying all effects for 
     * the given route.
     * @param currentRoute 
     */
    apply(currentRoute: string) {
        for (const effect of this.activeEffects) {
            effect.remove();
        }

        currentRoute = currentRoute || "/";
        for (const route in this.effects) {
            if (currentRoute.match(route)) {
                for (let i = 0; i < this.effects[route].length; i++) {
                    if (typeof this.effects[route][i] === "function") {
                        this.effects[route][i] = (this.effects[route][i] as () => Effect)();
                    }
                    (this.effects[route][i] as Effect).apply(currentRoute);
                }
            }
        }
    }
}