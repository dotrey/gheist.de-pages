var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import LibraryIndexLoader from "./files/LibraryIndexLoader.js";
import LibraryBookLoader from "./files/LibraryBookLoader.js";
export default class Library {
    constructor() {
        this.books = {};
        this.enabledBooks = [];
    }
    loadIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            this.index = yield (new LibraryIndexLoader()).load();
            return true;
        });
    }
    getBook(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof this.books[id] === "undefined") {
                let metadata = this.index.book(id);
                if (metadata) {
                    this.books[id] = yield (new LibraryBookLoader()).load(metadata.file);
                }
            }
            return this.books[id] || null;
        });
    }
    enableBook(id) {
        if (this.enabledBooks.indexOf(id) < 0) {
            this.enabledBooks.push(id);
        }
    }
    disableBook(id) {
        let i = this.enabledBooks.indexOf(id);
        if (i > -1) {
            this.enabledBooks.splice(i, 1);
        }
    }
    isBookEnabled(id) {
        return this.enabledBooks.indexOf(id) > -1;
    }
    enableBookGroup(group) {
        for (let bookId of this.index.booksOfGroup(group)) {
            this.enableBook(bookId);
        }
    }
    disableBookGroup(group) {
        for (let bookId of this.index.booksOfGroup(group)) {
            this.disableBook(bookId);
        }
    }
    isBookGroupEnabled(group) {
        for (let bookId of this.index.booksOfGroup(group)) {
            if (!this.isBookEnabled(bookId)) {
                return false;
            }
        }
        return true;
    }
}
//# sourceMappingURL=Library.js.map