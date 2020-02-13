import { IoBase } from "./ioBase.js";
class Input extends IoBase {
    constructor(module, index) {
        super(module, index);
        this.prev_output = null;
        this.constant = true;
        this.quick_const = '';
        this.stream_updated = false;
    }
    get_point() {
        return this.module.get_input_point(this.index);
    }
    connect_with_output(output) {
        this.prev_output = output;
        this.value1 = output.value1;
        this.value2 = output.value2;
        this.constant = output.module.is_constant();
        this.module.constant_update(true);
    }
    update_quick_const(quick_const, value) {
        this.quick_const = quick_const;
        this.value1 = value;
        this.value2 = value;
        this.module.constant_update(true);
    }
    disconnect_with_output() {
        this.prev_output = null;
        this.value1 = 0.0;
        this.value2 = 0.0;
        this.constant = true;
        this.module.constant_update(true);
    }
}
export { Input };
