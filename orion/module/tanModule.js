import { ModuleBase } from "./moduleBase.js";
class TanModule extends ModuleBase {
    constructor(x, y, removable, img) {
        super('tan_module', x, y, 1, 1, removable, img);
    }
    evaluate() {
        this.output_arr[0].value1 = Math.tan(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.tan(this.input_arr[0].value2);
    }
}
export { TanModule };
