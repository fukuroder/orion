import { ModuleBase } from "./moduleBase.js";
class MultiplyModule extends ModuleBase {
    constructor(x, y, removable, img) {
        super('multiply_module', x, y, 2, 1, removable, img);
    }
    evaluate() {
        this.output_arr[0].value1 = this.input_arr[0].value1 * this.input_arr[1].value1;
        this.output_arr[0].value2 = this.input_arr[0].value2 * this.input_arr[1].value2;
    }
}
export { MultiplyModule };