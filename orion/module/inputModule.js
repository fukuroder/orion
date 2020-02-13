import { ModuleBase } from "./moduleBase.js";
class InputModule extends ModuleBase {
    constructor(x, y, img) {
        super('input_module', x, y, 0, 1, false, img);
        this.value1 = 0.0;
        this.value2 = 0.0;
    }
    move(x, y) {
        this.y = y;
    }
    evaluate() {
        this.output_arr[0].value1 = this.value1;
        this.output_arr[0].value2 = this.value2;
    }
    is_constant() {
        return false;
    }
}
export { InputModule };
