class Rect {
    // Code in this class was taken from esphome/components/display/rect.cpp and translated to JavaScript
    static VALUE_NO_SET = 32766;
    constructor(x = Rect.VALUE_NO_SET, y = Rect.VALUE_NO_SET, w = Rect.VALUE_NO_SET, h = Rect.VALUE_NO_SET) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.h = Math.floor(h);
        this.w = Math.floor(w);
    }

    x2() {
        return this.x + this.w;
        ///< X coordinate of corner
    }

    y2() {
        return this.y + this.h;
        ///< Y coordinate of corner
    }

    is_set() {
        return (this.h != Rect.VALUE_NO_SET) && (this.w != Rect.VALUE_NO_SET);
    }

    expand(horizontal, vertical) {
        horizontal = Math.floor(horizontal);
        vertical = Math.floor(vertical);
        if (this.is_set() && (this.w >= (-2 * horizontal)) && (this.h >= (-2 * vertical))) {
            this.x = this.x - horizontal;
            this.y = this.y - vertical;
            this.w = this.w + (2 * horizontal);
            this.h = this.h + (2 * vertical);
        }
    }

    extend(rect) {
        if (!this.is_set()) {
            this.x = rect.x;
            this.y = rect.y;
            this.w = rect.w;
            this.h = rect.h;
        } else {
            if (this.x > rect.x) {
                this.w = this.w + (this.x - rect.x);
                this.x = rect.x;
            }
            if (this.y > rect.y) {
                this.h = this.h + (this.y - rect.y);
                this.y = rect.y;
            }
            if (this.x2() < rect.x2()) {
                this.w = rect.x2() - this.x;
            }
            if (this.y2() < rect.y2()) {
                this.h = rect.y2() - this.y;
            }
        }
    }

    shrink(rect) {
        if (!this.inside(rect)) {
            this.x = rect.x;
            this.y = rect.y;
            this.w = rect.w;
            this.h = rect.h;
        } else {
            if (this.x2() > rect.x2()) {
                this.w = rect.x2() - this.x;
            }
            if (this.x < rect.x) {
                this.w = this.w + (this.x - rect.x);
                this.x = rect.x;
            }
            if (this.y2() > rect.y2()) {
                this.h = rect.y2() - this.y;
            }
            if (this.y < rect.y) {
                this.h = this.h + (this.y - rect.y);
                this.y = rect.y;
            }
        }
    }

    inside(arg1, arg2 = null, arg3 = null) {
        let absolute = true;
        if (typeof(arg1) == "number") {
            let test_x = Math.floor(arg1);
            let test_y = Math.floor(arg2);
            if (arg3 !== null) {
                absolute = arg3;
            }
            if (!this.is_set()) {
                return true;
            }
            if (absolute) {
                return ((test_x >= this.x) && (test_x <= this.x2()) && (test_y >= this.y) && (test_y <= this.y2()));
            } else {
                return ((test_x >= 0) && (test_x <= this.w) && (test_y >= 0) && (test_y <= this.h));
            }
        } else {
            let rect = arg1;
            if (arg2 !== null) {
                absolute = arg3;
            }
            if (!this.is_set() || !rect.is_set()) {
                return true;
            }
            if (absolute) {
                return ((rect.x <= this.x2()) && (rect.x2() >= this.x) && (rect.y <= this.y2()) && (rect.y2() >= this.y));
            } else {
                return ((rect.x <= this.w) && (rect.w >= 0) && (rect.y <= this.h) && (rect.h >= 0));
            }
        }
    }

    equal(rect) {
        return (rect.x == this.x) && (rect.w == this.w) && (rect.y == this.y) && (rect.h == this.h);
    }
};
