import TestView from "./views/TestView.js";
import m from "./Mithril.js";
import GameView from "./views/GameView.js";
import MainView from "./views/MainView.js";
import LibraryView from "./views/LibraryView.js";
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
                    return m(MainView, {
                        cursed: me.cursed
                    });
                }
            },
            "/library": {
                render: function () {
                    return m(LibraryView, {
                        library: me.cursed.library
                    });
                }
            },
            "/game": {
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