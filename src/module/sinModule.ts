import {ModuleBase} from "./moduleBase.js"

/**
 * sin module.
 * @author fukuroda
 */
class SinModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public constructor(x:number, y:number, removable:boolean, img:HTMLImageElement){
        super('sin_module', x, y, 1, 1, removable, img);
    }

    /**
     * evaluate.
     */
    public evaluate():void{
        this.output_arr[0].value1 = Math.sin(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.sin(this.input_arr[0].value2);
    }
}

export{SinModule}