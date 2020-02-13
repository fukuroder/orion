import { Input } from "../io/input.js";
import { Output } from "../io/output.js";
class ModuleBase {
    constructor(name, x, y, num_in, num_out, removable, image) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.w = image.width;
        this.h = image.height;
        this.input_arr = [];
        for (var i = 0; i < num_in; i++) {
            this.input_arr.push(new Input(this, i));
        }
        this.output_arr = [];
        for (var i = 0; i < num_out; i++) {
            this.output_arr.push(new Output(this, i));
        }
        this.removable = removable;
        this.is_delay = false;
        this.image = image;
    }
    squareDistance(x1, y1, x2, y2) {
        return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    }
    is_constant() {
        return this.input_arr.every(input => input.constant);
    }
    constant_update(first) {
        if (this.is_delay == true && first == false) {
            return;
        }
        var is_constant = this.is_constant();
        if (is_constant == true) {
            this.evaluate();
        }
        for (var output of this.output_arr) {
            for (var next_input of output.next_input_arr) {
                if (is_constant == true) {
                    next_input.value1 = output.value1;
                    next_input.value2 = output.value2;
                }
                next_input.constant = is_constant;
                next_input.module.constant_update(false);
            }
            for (var next_input of output.quick_bus_next_input_arr) {
                if (is_constant == true) {
                    next_input.value1 = output.value1;
                    next_input.value2 = output.value2;
                }
                next_input.constant = is_constant;
                next_input.module.constant_update(false);
            }
        }
    }
    stream_update() {
        var order = [];
        var update = this.input_arr.every(input => input.constant || input.stream_updated);
        if (update == true) {
            order.push(this);
            for (var output of this.output_arr) {
                for (var next_input of output.next_input_arr) {
                    next_input.stream_updated = true;
                    order = order.concat(next_input.module.stream_update());
                }
                for (var next_input of output.quick_bus_next_input_arr) {
                    next_input.stream_updated = true;
                    order = order.concat(next_input.module.stream_update());
                }
            }
        }
        return order;
    }
    isLoop(prev_module) {
        if (this.is_delay == true) {
            return false;
        }
        if (prev_module == this) {
            return true;
        }
        for (var output of this.output_arr) {
            for (var next_input of output.next_input_arr) {
                var loop = next_input.module.isLoop(prev_module);
                if (loop == true) {
                    return true;
                }
            }
            for (var next_input of output.quick_bus_next_input_arr) {
                var loop = next_input.module.isLoop(prev_module);
                if (loop == true) {
                    return true;
                }
            }
        }
        return false;
    }
    get_input_point(index) {
        var x = this.x;
        var interval_h = this.h / this.input_arr.length;
        var y = Math.round(this.y + (index + 0.5) * interval_h);
        return { x: x, y: y };
    }
    get_output_point(index) {
        var x = this.x + this.w;
        var interval_h = this.h / this.output_arr.length;
        var y = Math.round(this.y + (index + 0.5) * interval_h);
        return { x: x, y: y };
    }
    hit_test_with_input(offset, tol) {
        if (this.input_arr.length > 0) {
            var point_x = this.x;
            var interval_h = this.h / this.input_arr.length;
            for (var i = 0; i < this.input_arr.length; i++) {
                var point_y = Math.round(this.y + (i + 0.5) * interval_h);
                if (this.squareDistance(point_x, point_y, offset.x, offset.y) < tol * tol) {
                    return i;
                }
            }
        }
        return -1;
    }
    hit_test_with_output(offset, tol) {
        if (this.output_arr.length > 0) {
            var point_x = this.x + this.w;
            var interval_h = this.h / this.output_arr.length;
            for (var i = 0; i < this.output_arr.length; i++) {
                var point_y = Math.round(this.y + (i + 0.5) * interval_h);
                if (this.squareDistance(point_x, point_y, offset.x, offset.y) < tol * tol) {
                    return i;
                }
            }
        }
        return -1;
    }
    hit_test_with_main(offset) {
        if (this.x <= offset.x && offset.x <= this.x + this.w &&
            this.y <= offset.y && offset.y <= this.y + this.h) {
            return true;
        }
        else {
            return false;
        }
    }
    move(x, y) {
        this.x = x;
        this.y = y;
    }
    removeModule() {
        for (var output of this.output_arr) {
            output.disconnect();
            output.disconnect_quickbus();
        }
        for (var input of this.input_arr) {
            var prev_output = input.prev_output;
            if (prev_output != null) {
                var removed = prev_output.disconnect(input);
                if (removed == false) {
                    prev_output.disconnect_quickbus(input);
                }
            }
        }
    }
    evaluate() {
    }
}
export { ModuleBase };
