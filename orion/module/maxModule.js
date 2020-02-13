import { ModuleBase } from "./moduleBase.js";
class MaxModule extends ModuleBase {
    constructor(x, y, removable, img) {
        super('max_module', x, y, 2, 1, removable, img);
    }
    evaluate() {
        this.output_arr[0].value1 = this.input_arr[0].value1 > this.input_arr[1].value1 ? this.input_arr[0].value1 : this.input_arr[1].value1;
        this.output_arr[0].value2 = this.input_arr[0].value2 > this.input_arr[1].value2 ? this.input_arr[0].value2 : this.input_arr[1].value2;
    }
}
export { MaxModule };
