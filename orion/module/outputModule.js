import { ModuleBase } from "./moduleBase.js";
class OutputModule extends ModuleBase {
    constructor(x, y, img) {
        super('output_module', x, y, 1, 0, false, img);
        this.value1 = 0.0;
        this.value2 = 0.0;
    }
    move(x, y) {
        this.y = y;
    }
    evaluate() {
        this.value1 = this.input_arr[0].value1;
        this.value2 = this.input_arr[0].value2;
    }
}
export { OutputModule };
