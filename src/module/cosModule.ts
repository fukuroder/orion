import {ModuleBase} from "./moduleBase.js"

/**
 * cos module.
 * @author fukuroda
 */
class CosModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public constructor(x:number, y:number, removable:boolean, img:HTMLImageElement){
        super('cos_module', x, y, 1, 1, removable, img);
    }

    /**
     * evaluate.
     */
    public evaluate():void{
        this.output_arr[0].value1 = Math.cos(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.cos(this.input_arr[0].value2);
    }
}

export{CosModule}