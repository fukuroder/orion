import { ModuleBase } from "./moduleBase.js";
class DelayModule extends ModuleBase {
    constructor(x, y, removable, img) {
        super('delay_module', x, y, 1, 1, removable, img);
        this.is_delay = true;
    }
    evaluate() {
        this.output_arr[0].value1 = this.input_arr[0].value1 + 1.0e-100;
        this.output_arr[0].value2 = this.input_arr[0].value2 + 1.0e-100;
    }
    is_constant() {
        return false;
    }
    stream_update() {
        return [];
    }
    delay_update() {
        var order = [this];
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
        return order;
    }
}
export { DelayModule };
