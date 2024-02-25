class Image {
    // Code in this class was taken from esphome/components/image/image.cpp and translated to JavaScript
    static IMAGE_TYPE_BINARY = 0;
    static IMAGE_TYPE_GRAYSCALE = 1;
    static IMAGE_TYPE_RGB24 = 2;
    static IMAGE_TYPE_RGB565 = 3;
    static IMAGE_TYPE_RGBA = 4;
    static TOP = 0x00;
    static CENTER_VERTICAL = 0x01;
    static BOTTOM = 0x02;
    static LEFT = 0x00;
    static CENTER_HORIZONTAL = 0x04;
    static RIGHT = 0x08;
    static TOP_LEFT = Image.TOP | Image.LEFT;
    static TOP_CENTER = Image.TOP | Image.CENTER_HORIZONTAL;
    static TOP_RIGHT = Image.TOP | Image.RIGHT;
    static CENTER_LEFT = Image.CENTER_VERTICAL | Image.LEFT;
    static CENTER = Image.CENTER_VERTICAL | Image.ENTER_HORIZONTAL;
    static CENTER_RIGHT = Image.CENTER_VERTICAL | Image.RIGHT;
    static BOTTOM_LEFT = Image.BOTTOM | Image.LEFT;
    static BOTTOM_CENTER = Image.BOTTOM | Image.CENTER_HORIZONTAL;
    static BOTTOM_RIGHT = Image.BOTTOM | Image.RIGHT;
    static HORIZONTAL_ALIGNMENT = Image.LEFT | Image.CENTER_HORIZONTAL | Image.RIGHT;
    static VERTICAL_ALIGNMENT = Image.TOP | Image.CENTER_VERTICAL | Image.BOTTOM;

    constructor(data, width, height, type) {
        this.data = data;
        this.width_ = Math.floor(width);
        this.height_ = Math.floor(height);
        this.type_ = type;
    }

    image_type_to_bpp(type) {
        switch (type) {
            case Image.IMAGE_TYPE_BINARY:
                return 1;
            case Image.IMAGE_TYPE_GRAYSCALE:
                return 8;
            case Image.IMAGE_TYPE_RGB565:
                return 16;
            case Image.IMAGE_TYPE_RGB24:
                return 24;
            case Image.IMAGE_TYPE_RGBA:
                return 32;
        }
        return 0;
    }

    image_type_to_width_stride(width, type) {
        return Math.floor((Math.floor(width) * this.image_type_to_bpp(type) + 7) / 8);
    }

    get_pixel(x, y, color_on, color_off) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || x >= this.width_ || y < 0 || y >= this.height_)
            return color_off;
        switch (this.type_) {
            case Image.IMAGE_TYPE_BINARY:
                return this.get_binary_pixel_(x, y) ? color_on : color_off;
            case Image.IMAGE_TYPE_GRAYSCALE:
                return this.get_grayscale_pixel_(x, y);
            case Image.IMAGE_TYPE_RGB565:
                return this.get_rgb565_pixel_(x, y);
            case Image.IMAGE_TYPE_RGB24:
                return this.get_rgb24_pixel_(x, y);
            case Image.IMAGE_TYPE_RGBA:
                return this.get_rgba_pixel_(x, y);
            default:
                return color_off;
        }
    }

    get_width() {
        return this.width_;
    }
    get_height() {
        return this.height_;
    }
    get_type() {
        return this.type_;
    }

    draw(x, y, display, color_on, color_off) {
        x = Math.floor(x);
        y = Math.floor(y);

        switch (this.type_) {
            case Image.IMAGE_TYPE_BINARY:
                {
                    for (let img_x = 0; img_x < this.width_; img_x++) {
                        for (let img_y = 0; img_y < this.height_; img_y++) {
                            if (this.get_binary_pixel_(img_x, img_y)) {
                                display.draw_pixel_at(x + img_x, y + img_y, color_on);
                            } else if (!this.transparent_) {
                                display.draw_pixel_at(x + img_x, y + img_y, color_off);
                            }
                        }
                    }
                    break;
                }
            case Image.IMAGE_TYPE_GRAYSCALE:
                for (let img_x = 0; img_x < this.width_; img_x++) {
                    for (let img_y = 0; img_y < this.height_; img_y++) {
                        let color = this.get_grayscale_pixel_(img_x, img_y);
                        if (color.w >= 0x80) {
                            display.draw_pixel_at(x + img_x, y + img_y, color);
                        }
                    }
                }
                break;
            case Image.IMAGE_TYPE_RGB565:
                for (let img_x = 0; img_x < this.width_; img_x++) {
                    for (let img_y = 0; img_y < this.height_; img_y++) {
                        let color = this.get_rgb565_pixel_(img_x, img_y);
                        if (color.w >= 0x80) {
                            display.draw_pixel_at(x + img_x, y + img_y, color);
                        }
                    }
                }
                break;
            case Image.IMAGE_TYPE_RGB24:
                for (let img_x = 0; img_x < this.width_; img_x++) {
                    for (let img_y = 0; img_y < this.height_; img_y++) {
                        let color = this.get_rgb24_pixel_(img_x, img_y);
                        if (color.w >= 0x80) {
                            display.draw_pixel_at(x + img_x, y + img_y, color);
                        }
                    }
                }
                break;
            case Image.IMAGE_TYPE_RGBA:
                for (let img_x = 0; img_x < this.width_; img_x++) {
                    for (let img_y = 0; img_y < this.height_; img_y++) {
                        let color = this.get_rgba_pixel_(img_x, img_y);
                        if (color.w >= 0x80) {
                            display.draw_pixel_at(x + img_x, y + img_y, color);
                        }
                    }
                }
                break;
        }
    }

    set_transparency(transparent) {
        this.transparent_ = transparent;
    }
    has_transparency() {
        return this.transparent_;
    }

    get_binary_pixel_(x, y) {
        let width_8 = Math.floor((this.width_ + 7) / 8) * 8;
        let pos = x + y * width_8;
        return this.data[(Math.floor(pos / 8))] & (0x80 >> (pos % 8));
    }
    get_rgba_pixel_(x, y) {
        let pos = (x + y * this.width_) * 4;
        return new Color(this.data[pos + 0], this.data[pos + 1], this.data[pos + 2], this.data[pos + 3]);
    }
    get_rgb24_pixel_(x, y) {
        let pos = (x + y * this.width_) * 3;
        let color = new Color(this.data[pos + 0], this.data[pos + 1], this.data[pos + 2]);
        if (color.b == 1 && color.r == 0 && color.g == 0 && this.transparent_) {
            // (0, 0, 1) has been defined as transparent color for non-alpha images.
            // putting blue == 1 as a first condition for performance reasons (least likely value to short-cut the if)
            color.w = 0;
        } else {
            color.w = 0xFF;
        }
        return color;
    }
    get_rgb565_pixel_(x, y) {
        let pos = (x + y * this.width_) * 2;
        let rgb565 = this.data[pos + 0] << 8 | this.data[pos + 1];
        let r = (rgb565 & 0xF800) >> 11;
        let g = (rgb565 & 0x07E0) >> 5;
        let b = rgb565 & 0x001F;
        let color = new Color((r << 3) | (r >> 2), (g << 2) | (g >> 4), (b << 3) | (b >> 2));
        if (rgb565 == 0x0020 && this.transparent_) {
            // darkest green has been defined as transparent color for transparent RGB565 images.
            color.w = 0;
        } else {
            color.w = 0xFF;
        }
        return color;
    }
    get_grayscale_pixel_(x, y) {
        let pos = (x + y * this.width_);
        let gray = this.data[pos];
        let alpha = (gray == 1 && this.transparent_) ? 0 : 0xFF;
        return new Color(gray, gray, gray, alpha);
    }
}
