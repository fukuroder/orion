import {ModuleBase} from "./moduleBase"

/**
 * samplerate module.
 * @author fukuroda
 */
class SampleRateModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public constructor(x:number, y:number, img:HTMLImageElement){
        super('samplerate_module', x, y, 0, 1, false, img);
    }

    /**
     * 移動.
     * @param x
     * @param y
     */
    public move(x:number, y:number):void {
        // 上下の移動のみとする
        this.y = y;
    }
}

export{SampleRateModule}