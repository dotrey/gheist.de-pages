import m from "../../Mitrhil.js";
const RomajiBoardView = {
    oncreate(vnode) {
        vnode.attrs.input.registerRomajiBoard("game-romajiboard");
    },
    view() {
        return m(".romajiboard", {
            "id": "game-romajiboard"
        }, [
            this.buildVocalPanel(),
            this.buildConsonantPanel()
        ]);
    },
    buildVocalPanel() {
        const keys = [
            "a", "e", "i", "o", "u"
        ];
        return m(".romajiboard-scrollrow", m(".romajiboard-panel", {}, keys.map((k) => {
            return this.buildKey(k);
        })));
    },
    buildConsonantPanel() {
        const panels = [
            [
                "k", "s", "t", "n", "h",
            ],
            [
                "m", "y", "r", "w", "c"
            ],
            [
                "g", "d", "b", "p", "y"
            ],
            [
                "z", "j", "c", "h", ""
            ]
        ];
        return m(".romajiboard-scrollrow", {
            "data-scrollable": "1",
            "style": "top: var(--panel-height);"
        }, [
            panels.map((keys, i) => {
                return m(".romajiboard-panel", {
                    "style": "left: " + (i * 100) + "vw;"
                }, keys.map((key) => {
                    return this.buildKey(key);
                }));
            })
        ]);
    },
    buildKey(key) {
        return m(".romajiboard-key", {
            "data-key": key
        }, key);
    }
};
export default RomajiBoardView;
//# sourceMappingURL=RomajiboardView.js.map