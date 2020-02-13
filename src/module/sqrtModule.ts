import {ModuleBase} from "./moduleBase.js"

/**
 * sqrt module.
 * @author fukuroda
 */
class SqrtModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public constructor(x:number, y:number, removable:boolean, img:HTMLImageElement){
        super('sqrt_module', x, y, 1, 1, removable, img);
    }

    /**
     * evaluate.
     */
    public evaluate():void{
        this.output_arr[0].value1 = Math.sqrt(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.sqrt(this.input_arr[0].value2);
    }
}

export{SqrtModule}