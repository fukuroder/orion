import { ModuleBase } from "./moduleBase.js";
class ControlModule extends ModuleBase {
    constructor(x, y, img, idx) {
        super('control_module', x, y, 0, 1, false, img);
        this.value = 0.5;
        this.idx = idx;
    }
    move(x, y) {
        this.y = y;
    }
    evaluate() {
        this.output_arr[0].value1 = this.value;
        this.output_arr[0].value2 = this.value;
    }
}
export { ControlModule };
