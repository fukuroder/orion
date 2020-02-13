import { ModuleBase } from "./moduleBase.js";
class SampleRateModule extends ModuleBase {
    constructor(x, y, img) {
        super('samplerate_module', x, y, 0, 1, false, img);
    }
    move(x, y) {
        this.y = y;
    }
}
export { SampleRateModule };
