import ColorConverter from "../../util/ColorConverter.js";
export default class LibraryBook {
    constructor() {
        this.id = "";
        this.name = "";
        this.file = "";
        this.group = "";
        this._wordCount = 0;
        this._color = "";
    }
    get wordCount() {
        return this.words ? this.words.length : this._wordCount;
    }
    get color() {
        if (!this._color) {
            let value = this.id;
            let hue = 0;
            let lightness = 50;
            let saturation = 50;
            for (var i = 0, ic = value.length; i < ic; i++) {
                switch (i % 3) {
                    case 0:
                        hue = (hue + value.charCodeAt(i) * i) % 360;
                        break;
                    case 1:
                        lightness = (lightness + value.charCodeAt(i) * i) % 100;
                        break;
                    case 2:
                        saturation = (saturation + value.charCodeAt(i) * i) % 100;
                        break;
                }
            }
            lightness = Math.max(20, Math.min(70, lightness));
            saturation = Math.max(50, Math.min(100, saturation));
            var rgb = ColorConverter.hslToRgb(hue / 360, saturation / 100, lightness / 100);
            this._color = "#" + (rgb.r < 16 ? "0" : "") + rgb.r.toString(16)
                + (rgb.g < 16 ? "0" : "") + rgb.g.toString(16)
                + (rgb.b < 16 ? "0" : "") + rgb.b.toString(16);
        }
        return this._color;
    }
}
//# sourceMappingURL=LibraryBook.js.map