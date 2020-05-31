import TestView from "./views/TestView.js";
import m from "./Mitrhil.js";
import GameView from "./views/GameView.js";
export default class Ui {
    constructor(cursed) {
        this.cursed = cursed;
        this.setup();
    }
    setup() {
        let me = this;
        m.route(document.body, "/", {
            "/": {
                render: function () {
                    return m(GameView, {
                        game: me.cursed.game
                    });
                }
            },
            "/test": TestView
        });
    }
}
//# sourceMappingURL=Ui.js.map