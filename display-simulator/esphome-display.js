class Color {
    constructor(red = 0, green = 0, blue = 0, white = 0) {
        this.r = red;
        this.g = green;
        this.b = blue;
        this.w = white;
    }
}

class Display {
    // Code in this class was taken from esphome/components/display/display.cpp and translated to JavaScript
    constructor() {}

    fill(color) {
        this.filled_rectangle(0, 0, this.get_width(), this.get_height(), color);
    }

    clear() {
        this.fill(this.COLOR_OFF);
    }

    line(x1, y1, x2, y2, color = this.COLOR_ON) {
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        let dx = Math.abs(x2 - x1),
            sx = x1 < x2 ? 1 : -1;
        let dy = -Math.abs(y2 - y1),
            sy = y1 < y2 ? 1 : -1;
        let err = dx + dy;

        while (true) {
            this.draw_pixel_at(x1, y1, color);
            if (x1 == x2 && y1 == y2)
                break;
            let e2 = 2 * err;
            if (e2 >= dy) {
                err += dy;
                x1 += sx;
            }
            if (e2 <= dx) {
                err += dx;
                y1 += sy;
            }
        }
    }

    horizontal_line(x, y, width, color = this.COLOR_ON) {
        x = Math.floor(x);
        y = Math.floor(y);
        width = Math.floor(width);
        for (let i = x; i < x + width; i++)
            this.draw_pixel_at(i, y, color);
    }

    vertical_line(x, y, height, color = this.COLOR_ON) {
        x = Math.floor(x);
        y = Math.floor(y);
        height = Math.floor(height);
        for (let i = y; i < y + height; i++)
            this.draw_pixel_at(x, i, color);
    }

    rectangle(x1, y1, width, height, color = this.COLOR_ON) {
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        width = Math.floor(width);
        height = Math.floor(height);
        this.horizontal_line(x1, y1, width, color);
        this.horizontal_line(x1, y1 + height - 1, width, color);
        this.vertical_line(x1, y1, height, color);
        this.vertical_line(x1 + width - 1, y1, height, color);
    }

    filled_rectangle(x1, y1, width, height, color = this.COLOR_ON) {
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        width = Math.floor(width);
        height = Math.floor(height);
        for (let i = y1; i < y1 + height; i++) {
            this.horizontal_line(x1, i, width, color);
        }
    }

    circle(center_x, center_y, radius, color = this.COLOR_ON) {
        center_x = Math.floor(center_x);
        center_y = Math.floor(center_y);
        radius = Math.floor(radius);
        let dx = -radius;
        let dy = 0;
        let err = 2 - 2 * radius;
        let e2;

        do {
            this.draw_pixel_at(center_x - dx, center_y + dy, color);
            this.draw_pixel_at(center_x + dx, center_y + dy, color);
            this.draw_pixel_at(center_x + dx, center_y - dy, color);
            this.draw_pixel_at(center_x - dx, center_y - dy, color);
            e2 = err;
            if (e2 < dy) {
                err += ++dy * 2 + 1;
                if (-dx == dy && e2 <= dx) {
                    e2 = 0;
                }
            }
            if (e2 > dx) {
                err += ++dx * 2 + 1;
            }
        } while (dx <= 0);
    }

    filled_circle(center_x, center_y, radius, color = this.COLOR_ON) {
        center_x = Math.floor(center_x);
        center_y = Math.floor(center_y);
        radius = Math.floor(radius);
        let dx = -radius;
        let dy = 0;
        let err = 2 - 2 * radius;
        let e2;

        do {
            this.draw_pixel_at(center_x - dx, center_y + dy, color);
            this.draw_pixel_at(center_x + dx, center_y + dy, color);
            this.draw_pixel_at(center_x + dx, center_y - dy, color);
            this.draw_pixel_at(center_x - dx, center_y - dy, color);
            let hline_width = 2 * (-dx) + 1;
            this.horizontal_line(center_x + dx, center_y + dy, hline_width, color);
            this.horizontal_line(center_x + dx, center_y - dy, hline_width, color);
            e2 = err;
            if (e2 < dy) {
                err += ++dy * 2 + 1;
                if (-dx == dy && e2 <= dx) {
                    e2 = 0;
                }
            }
            if (e2 > dx) {
                err += ++dx * 2 + 1;
            }
        } while (dx <= 0);
    }

    triangle(x1, y1, x2, y2, x3, y3, color = this.COLOR_ON) {
        this.line(x1, y1, x2, y2, color);
        this.line(x1, y1, x3, y3, color);
        this.line(x2, y2, x3, y3, color);
    }

    filled_flat_side_triangle_(x1, y1, x2, y2, x3, y3, color = this.COLOR_ON) {
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        x3 = Math.floor(x3);
        y3 = Math.floor(y3);
        // y2 must be equal to y3 (same horizontal line)

        // Initialize Bresenham's algorithm for side 1
        let s1_current_x = x1;
        let s1_current_y = y1;
        let s1_axis_swap = false;
        let s1_dx = Math.abs(x2 - x1);
        let s1_dy = Math.abs(y2 - y1);
        let s1_sign_x = ((x2 - x1) >= 0) ? 1 : -1;
        let s1_sign_y = ((y2 - y1) >= 0) ? 1 : -1;
        if (s1_dy > s1_dx) { // swap values
            [s1_dx, s1_dy] = [s1_dy, s1_dx];
            s1_axis_swap = true;
        }
        let s1_error = 2 * s1_dy - s1_dx;

        // Initialize Bresenham's algorithm for side 2
        let s2_current_x = x1;
        let s2_current_y = y1;
        let s2_axis_swap = false;
        let s2_dx = Math.abs(x3 - x1);
        let s2_dy = Math.abs(y3 - y1);
        let s2_sign_x = ((x3 - x1) >= 0) ? 1 : -1;
        let s2_sign_y = ((y3 - y1) >= 0) ? 1 : -1;
        if (s2_dy > s2_dx) { // swap values
            [s2_dx, s2_dy] = [s2_dy, s2_dx];
            s2_axis_swap = true;
        }
        let s2_error = 2 * s2_dy - s2_dx;

        // Iterate on side 1 and allow side 2 to be processed to match the advance of the y-axis.
        for (let i = 0; i <= s1_dx; i++) {
            if (s1_current_x <= s2_current_x) {
                this.horizontal_line(s1_current_x, s1_current_y, s2_current_x - s1_current_x + 1, color);
            } else {
                this.horizontal_line(s2_current_x, s2_current_y, s1_current_x - s2_current_x + 1, color);
            }

            // Bresenham's #1
            // Side 1 s1_current_x and s1_current_y calculation
            while (s1_error >= 0) {
                if (s1_axis_swap) {
                    s1_current_x += s1_sign_x;
                } else {
                    s1_current_y += s1_sign_y;
                }
                s1_error = s1_error - 2 * s1_dx;
            }
            if (s1_axis_swap) {
                s1_current_y += s1_sign_y;
            } else {
                s1_current_x += s1_sign_x;
            }
            s1_error = s1_error + 2 * s1_dy;

            // Bresenham's #2
            // Side 2 s2_current_x and s2_current_y calculation
            while (s2_current_y != s1_current_y) {
                while (s2_error >= 0) {
                    if (s2_axis_swap) {
                        s2_current_x += s2_sign_x;
                    } else {
                        s2_current_y += s2_sign_y;
                    }
                    s2_error = s2_error - 2 * s2_dx;
                }
                if (s2_axis_swap) {
                    s2_current_y += s2_sign_y;
                } else {
                    s2_current_x += s2_sign_x;
                }
                s2_error = s2_error + 2 * s2_dy;
            }
        }
    }

    filled_triangle(x1, y1, x2, y2, x3, y3, color = this.COLOR_ON) {
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        x3 = Math.floor(x3);
        y3 = Math.floor(y3);
        // Sort the three points by y-coordinate ascending, so [x1,y1] is the topmost point
        if (y1 > y2) {
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
        }
        if (y1 > y3) {
            [x1, x3] = [x3, x1];
            [y1, y3] = [y3, y1];
        }
        if (y2 > y3) {
            [x2, x3] = [x3, x2];
            [y2, y3] = [y3, y2];
        }

        if (y2 == y3) { // Check for special case of a bottom-flat triangle
            this.filled_flat_side_triangle_(x1, y1, x2, y2, x3, y3, color);
        } else if (y1 == y2) { // Check for special case of a top-flat triangle
            this.filled_flat_side_triangle_(x3, y3, x1, y1, x2, y2, color);
        } else { // General case: split the no-flat-side triangle in a top-flat triangle and bottom-flat triangle
            let x_temp = Math.floor(x1 + Math.floor((y2 - y1) / (y3 - y1)) * (x3 - x1)),
                y_temp = y2;
            this.filled_flat_side_triangle_(x1, y1, x2, y2, x_temp, y_temp, color);
            this.filled_flat_side_triangle_(x3, y3, x2, y2, x_temp, y_temp, color);
        }
    }

    print(x, y, font, arg4, arg5 = null, arg6 = null) {
        let color = this.COLOR_ON;
        let align = Font.TOP_LEFT;
        let text;
        if (arg5 === null && arg6 === null) {
            text = arg4;
        } else if (arg6 === null) {
            if (typeof(arg4) == "number") {
                align = arg4;
            } else {
                color = arg4;
            }
            text = arg5;
        } else {
            color = arg4;
            align = arg5;
            text = arg6;
        }
        x = Math.floor(x);
        y = Math.floor(y);
        let [x_start, y_start, width, height] = this.get_text_bounds(x, y, text, font, align);
        font.print(x_start, y_start, this, color, text);
    }

    image(x, y, image, arg4 = null, arg5 = null, arg6 = null) {
        let align = Image.TOP_LEFT;
        let color_on = this.COLOR_ON;
        let color_off = this.COLOR_OFF
        if (typeof(arg4) == "number") {
            align = arg4;
            if (arg5 !== null) {
                color_on = arg5;
                if (arg6 !== null) {
                    color_off = arg6;
                }
            }
        } else if (arg4 !== null) {
            color_on = arg4;
            if (arg5 !== null) {
                color_off = arg5;
            }
        }
        x = Math.floor(x);
        y = Math.floor(y);
        let x_align = Math.floor(align) & Image.HORIZONTAL_ALIGNMENT;
        let y_align = Math.floor(align) & Image.VERTICAL_ALIGNMENT;

        switch (x_align) {
            case Image.RIGHT:
                x -= image.get_width();
                break;
            case Image.CENTER_HORIZONTAL:
                x -= Math.floor(image.get_width() / 2);
                break;
            case Image.LEFT:
            default:
                break;
        }

        switch (y_align) {
            case Image.BOTTOM:
                y -= image.get_height();
                break;
            case Image.CENTER_VERTICAL:
                y -= Math.floor(image.get_height() / 2);
                break;
            case Image.TOP:
            default:
                break;
        }

        image.draw(x, y, this, color_on, color_off);
    }

    get_text_bounds(x, y, text, font, align) {
        let [width, x_offset, baseline, height] = font.measure(text);

        let x_align = Math.floor(align) & 0x18;
        let y_align = Math.floor(align) & 0x07;
        let x1, y1;

        switch (x_align) {
            case Font.RIGHT:
                x1 = x - width;
                break;
            case Font.CENTER_HORIZONTAL:
                x1 = x - Math.floor(width / 2);
                break;
            case Font.LEFT:
            default:
                // LEFT
                x1 = x;
                break;
        }

        switch (y_align) {
            case Font.BOTTOM:
                y1 = y - height;
                break;
            case Font.BASELINE:
                y1 = y - baseline;
                break;
            case Font.CENTER_VERTICAL:
                y1 = y - Math.floor(height / 2);
                break;
            case Font.TOP:
            default:
                y1 = y;
                break;
        }
        return [x1, y1, width, height];
    }
}
