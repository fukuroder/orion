import { ModuleBase } from "./moduleBase.js";
class SinModule extends ModuleBase {
    constructor(x, y, removable, img) {
        super('sin_module', x, y, 1, 1, removable, img);
    }
    evaluate() {
        this.output_arr[0].value1 = Math.sin(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.sin(this.input_arr[0].value2);
    }
}
export { SinModule };
