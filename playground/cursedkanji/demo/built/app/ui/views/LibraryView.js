import m from "../Mithril.js";
const LibraryView = {
    oninit(vnode) {
        let library = vnode.attrs.library;
        if (!library.index) {
            library.loadIndex().then(() => {
                m.redraw();
            });
        }
    },
    view(vnode) {
        let library = vnode.attrs.library;
        return m(".container.library", [
            this.buildHeader(),
            this.buildBooks(library)
        ]);
    },
    buildHeader() {
        return m(".library-header", [
            "Library",
            this.buildHeaderBackButton()
        ]);
    },
    buildHeaderBackButton() {
        return m(".library-header-back-button", {
            onclick: () => {
                window.history.back();
            }
        });
    },
    buildBooks(library) {
        if (!library || !library.index) {
            return null;
        }
        let groups = [];
        for (let group in library.index.groups) {
            if (library.index.booksOfGroup(group).length) {
                groups.push(this.buildBookGroup(group, library));
            }
        }
        return m(".library-books", groups);
    },
    buildBookGroup(group, library) {
        let checkboxOptions = {
            "type": "checkbox",
            onchange: function () {
                if (this.checked) {
                    library.enableBookGroup(group);
                }
                else {
                    library.disableBookGroup(group);
                }
                m.redraw();
            }
        };
        if (library.isBookGroupEnabled(group)) {
            checkboxOptions["checked"] = true;
        }
        return m(".library-book-group", [
            m("label.library-book-group-title", [
                m("input", checkboxOptions),
                library.index.groups[group] || "unknown group"
            ]),
            library.index.booksOfGroup(group).map((bookId) => {
                return this.buildBook(library.index.book(bookId), library);
            })
        ]);
    },
    buildBook(book, library) {
        if (!book) {
            return null;
        }
        let checkboxOptions = {
            "type": "checkbox",
            onchange: function () {
                if (this.checked) {
                    library.enableBook(book.id);
                }
                else {
                    library.disableBook(book.id);
                }
            }
        };
        if (library.isBookEnabled(book.id)) {
            checkboxOptions["checked"] = true;
        }
        return m(".library-book", {
            "style": "border-left-color: " + book.color + ";"
        }, [
            m("label.library-book-title", [
                m("input", checkboxOptions),
                book.name
            ])
        ]);
    }
};
export default LibraryView;
//# sourceMappingURL=LibraryView.js.map