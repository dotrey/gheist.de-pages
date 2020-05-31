import Ui from "./app/ui/Ui.js";
import Game from "./app/game/Game.js";
export default class CursedKanji {
    constructor() {
        this.build();
    }
    build() {
        this.game = new Game();
        this.ui = new Ui(this);
    }
}
//# sourceMappingURL=CursedKanji.js.map