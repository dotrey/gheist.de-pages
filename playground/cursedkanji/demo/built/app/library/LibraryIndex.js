export default class LibraryIndex {
    constructor() {
        this.version = 0;
        this.books = [];
        this.groups = {};
        this.bookMap = {};
        this.groupBookMapping = {};
    }
    book(id) {
        if (typeof this.bookMap[id] !== "undefined") {
            return this.bookMap[id];
        }
        return null;
    }
    booksOfGroup(group) {
        if (typeof this.groupBookMapping[group] !== "undefined") {
            return this.groupBookMapping[group];
        }
        return [];
    }
    refreshMappings() {
        this.refreshBookMapping();
        this.refreshGroupBookMapping();
    }
    refreshBookMapping() {
        this.bookMap = {};
        for (let book of this.books) {
            this.bookMap[book.id] = book;
        }
    }
    refreshGroupBookMapping() {
        for (let book of this.books) {
            if (typeof this.groupBookMapping[book.group] === "undefined") {
                this.groupBookMapping[book.group] = [];
            }
            this.groupBookMapping[book.group].push(book.id);
        }
    }
}
//# sourceMappingURL=LibraryIndex.js.map