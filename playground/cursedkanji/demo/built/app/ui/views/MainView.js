import m from "../Mithril.js";
const MainView = {
    oninit(vnode) {
        vnode.attrs.cursed.library.loadIndex().then(() => {
            m.redraw();
        });
    },
    view(vnode) {
        return m(".container.main", [
            this.buildLibrary(vnode),
            this.buildGameLength(),
            this.buildGameStart()
        ]);
    },
    buildLibrary(vnode) {
        return m(".library", [
            this.buildLibraryShelf(vnode),
            this.buildLibraryShelfButton()
        ]);
    },
    buildLibraryShelf(vnode) {
        let library = vnode.attrs.cursed.library;
        let books = [];
        if (library.index) {
            let totalCount = 0;
            for (let book of library.index.books) {
                totalCount += book.wordCount;
            }
            let avgCount = totalCount / library.index.books.length;
            for (let book of library.index.books) {
                books.push(this.buildLibraryShelfBook(book, avgCount, !library.isBookEnabled(book.id)));
            }
        }
        return m(".library-shelf", books);
    },
    buildLibraryShelfBook(book, avgWordCount, hidden) {
        if (avgWordCount === 0) {
            avgWordCount = 1;
        }
        let heightVariance = book.wordCount / avgWordCount - 1;
        heightVariance = Math.min(1, Math.max(-1, heightVariance));
        let invisibleCss = "";
        if (hidden) {
            invisibleCss = "visibility: hidden;";
        }
        return m(".library-shelf-book", m("div", {
            "style": "background:" + book.color + ";" +
                "height: calc(var(--book-height) + var(--book-height-variance) * " + heightVariance + ");" +
                invisibleCss
        }));
    },
    buildLibraryShelfButton() {
        return m(".library-shelf-button", {
            onclick: () => {
                window.location.hash = "#!/library";
            }
        }, "select lessons");
    },
    buildGameLength() {
        return m(".game-length");
    },
    buildGameStart() {
        return m(".game-start", {
            onclick: () => {
                window.location.hash = "#!/game";
            }
        }, "start game");
    }
};
export default MainView;
//# sourceMappingURL=MainView.js.map