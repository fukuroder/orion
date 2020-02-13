import { ModuleBase } from "./moduleBase.js";
class CosModule extends ModuleBase {
    constructor(x, y, removable, img) {
        super('cos_module', x, y, 1, 1, removable, img);
    }
    evaluate() {
        this.output_arr[0].value1 = Math.cos(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.cos(this.input_arr[0].value2);
    }
}
export { CosModule };
