import {ModuleBase} from "./moduleBase.js"

/**
 * tan module.
 * @author fukuroda
 */
class TanModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public constructor(x:number, y:number, removable:boolean, img:HTMLImageElement){
        super('tan_module', x, y, 1, 1, removable, img);
    }

    /**
     * evaluate.
     */
    public evaluate():void{
        this.output_arr[0].value1 = Math.tan(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.tan(this.input_arr[0].value2);
    }
}

export{TanModule}