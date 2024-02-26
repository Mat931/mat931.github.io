class Glyph {
    // Code in this class was taken from esphome/components/font/font.cpp and translated to JavaScript

    constructor(data) {
        this.glyph_data_ = data;
    }

    draw(x, y, display, color) {
        let x_at = Math.floor(x)
        let y_start = Math.floor(y);
        let scan_x1 = this.glyph_data_.offset_x;
        let scan_y1 = this.glyph_data_.offset_y;
        let scan_width = this.glyph_data_.width;
        let scan_height = this.glyph_data_.height;

        let data = 0;
        let max_x = x_at + scan_x1 + scan_width;
        let max_y = y_start + scan_y1 + scan_height;

        for (let glyph_y = y_start + scan_y1; glyph_y < max_y; glyph_y++) {
            for (let glyph_x = x_at + scan_x1; glyph_x < max_x; data++, glyph_x += 8) {
                let pixel_data = this.glyph_data_.data[data];
                let pixel_max_x = Math.min(max_x, glyph_x + 8);

                for (let pixel_x = glyph_x; pixel_x < pixel_max_x && pixel_data; pixel_x++, pixel_data <<= 1) {
                    if (pixel_data & 0x80) {
                        display.draw_pixel_at(pixel_x, glyph_y, color);
                    }
                }
            }
        }
    }

    get_char() {
        return this.glyph_data_.a_char;
    }

    compare_to(str) {
        // 1 -> this.char_
        // 2 -> str
        for (let i = 0;; i++) {
            if (this.glyph_data_.a_char.charCodeAt(i) == 0)
                return true;
            if (str.charCodeAt(i) == 0)
                return false;
            if (this.glyph_data_.a_char.charCodeAt(i) > str.charCodeAt(i))
                return false;
            if (this.glyph_data_.a_char.charCodeAt(i) < str.charCodeAt(i))
                return true;
        }
        // this should not happen
        return false;
    }

    match_length(str) {
        for (let i = 0;; i++) {
            if (this.glyph_data_.a_char.charCodeAt(i) == 0)
                return i;
            if (str.charCodeAt(i) != this.glyph_data_.a_char.charCodeAt(i))
                return 0;
        }
        // this should not happen
        return 0;
    }
}

class Font {
    // Code in this class was taken from esphome/components/font/font.cpp and translated to JavaScript
    static TOP = 0x00;
    static CENTER_VERTICAL = 0x01;
    static BASELINE = 0x02;
    static BOTTOM = 0x04;
    static LEFT = 0x00;
    static CENTER_HORIZONTAL = 0x08;
    static RIGHT = 0x10;
    static TOP_LEFT = Font.TOP | Font.LEFT;
    static TOP_CENTER = Font.TOP | Font.CENTER_HORIZONTAL;
    static TOP_RIGHT = Font.TOP | Font.RIGHT;
    static CENTER_LEFT = Font.CENTER_VERTICAL | Font.LEFT;
    static CENTER = Font.CENTER_VERTICAL | Font.CENTER_HORIZONTAL;
    static CENTER_RIGHT = Font.CENTER_VERTICAL | Font.RIGHT;
    static BASELINE_LEFT = Font.BASELINE | Font.LEFT;
    static BASELINE_CENTER = Font.BASELINE | Font.CENTER_HORIZONTAL;
    static BASELINE_RIGHT = Font.BASELINE | Font.RIGHT;
    static BOTTOM_LEFT = Font.BOTTOM | Font.LEFT;
    static BOTTOM_CENTER = Font.BOTTOM | Font.CENTER_HORIZONTAL;
    static BOTTOM_RIGHT = Font.BOTTOM | Font.RIGHT;

    constructor(data, data_nr, baseline, height) {
        this.glyphs_ = [];
        for (let i = 0; i < data.length; i++) {
            this.glyphs_.push(new Glyph(data[i]));
        }

        this.baseline_ = Math.floor(baseline);
        this.height_ = Math.floor(height);
    }

    match_next_glyph(str) {
        let lo = 0;
        let hi = this.glyphs_.length - 1;
        while (lo != hi) {
            let mid = Math.floor((lo + hi + 1) / 2);
            if (this.glyphs_[mid].compare_to(str)) {
                lo = mid;
            } else {
                hi = mid - 1;
            }
        }
        let match_length = this.glyphs_[lo].match_length(str);
        if (match_length <= 0)
            return [-1, match_length];
        return [lo, match_length];
    }

    print(x_start, y_start, display, color, text) {
        let i = 0;
        let x_at = x_start;
        if (text[text.length - 1] != "\u0000") {
            text += "\u0000"
        }
        while (text[i] != "\u0000") {
            let [glyph_n, match_length] = this.match_next_glyph(text.substring(i));
            if (glyph_n < 0) {
                // Unknown char, skip
                console.log("Encountered character without representation in font: '" + text[i] + "'");
                if (this.get_glyphs().length > 0) {
                    let glyph_width = this.get_glyphs()[0].glyph_data_.width;
                    display.filled_rectangle(x_at, y_start, glyph_width, this.height_, color);
                    x_at += glyph_width;
                }

                i++;
                continue;
            }

            let glyph = this.get_glyphs()[glyph_n];
            glyph.draw(x_at, y_start, display, color);
            x_at += glyph.glyph_data_.width + glyph.glyph_data_.offset_x;
            i += match_length;
        }
    }

    measure(str) {
        let i = 0;
        let min_x = 0;
        let has_char = false;
        let x = 0;
        if (str[str.length - 1] != "\u0000") {
            str += "\u0000"
        }
        while (str[i] != "\u0000") {
            let [glyph_n, match_length] = this.match_next_glyph(str.substring(i));
            if (glyph_n < 0) {
                // Unknown char, skip
                if (this.get_glyphs().length > 0)
                    x += this.get_glyphs()[0].glyph_data_.width;
                i++;
                continue;
            }

            let glyph = this.glyphs_[glyph_n];
            if (!has_char) {
                min_x = glyph.glyph_data_.offset_x;
            } else {
                min_x = Math.min(min_x, x + glyph.glyph_data_.offset_x);
            }
            x += glyph.glyph_data_.width + glyph.glyph_data_.offset_x;

            i += match_length;
            has_char = true;
        }
        return [(x - min_x), min_x, this.baseline_, this.height_];
    }

    get_baseline() {
        return this.baseline_;
    }

    get_height() {
        return this.height_;
    }

    get_glyphs() {
        return this.glyphs_;
    }
}
