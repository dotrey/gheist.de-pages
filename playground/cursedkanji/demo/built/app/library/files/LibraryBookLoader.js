var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import LibraryBook from "../LibraryBook.js";
export default class LibraryBookLoader {
    constructor() {
        this.basePath = "./assets/data/";
    }
    load(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (file.length && file.substr(0, 1) === "/") {
                file = file.substr(1);
            }
            const response = yield fetch(this.basePath + file);
            const json = yield response.json();
            return Object.assign(new LibraryBook(), json);
        });
    }
}
//# sourceMappingURL=LibraryBookLoader.js.map