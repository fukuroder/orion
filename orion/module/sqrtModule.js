import { ModuleBase } from "./moduleBase.js";
class SqrtModule extends ModuleBase {
    constructor(x, y, removable, img) {
        super('sqrt_module', x, y, 1, 1, removable, img);
    }
    evaluate() {
        this.output_arr[0].value1 = Math.sqrt(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.sqrt(this.input_arr[0].value2);
    }
}
export { SqrtModule };
