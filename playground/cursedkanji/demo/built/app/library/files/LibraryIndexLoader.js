var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import LibraryIndex from "../LibraryIndex.js";
import LibraryBook from "../LibraryBook.js";
export default class LibraryIndexLoader {
    constructor() {
        this.indexFile = "./assets/data/index.json";
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(this.indexFile);
            const json = yield response.json();
            let index = Object.assign(new LibraryIndex(), json);
            for (let i = 0, ic = index.books.length; i < ic; i++) {
                index.books[i] = Object.assign(new LibraryBook(), index.books[i]);
            }
            index.refreshMappings();
            return index;
        });
    }
}
//# sourceMappingURL=LibraryIndexLoader.js.map