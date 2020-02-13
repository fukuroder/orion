import {ModuleBase} from "./moduleBase.js"

/**
 * add module.
 * @author fukuroda
 */
class AddModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public constructor(x:number, y:number, removable:boolean, img:HTMLImageElement) {
        super('add_module', x, y, 2, 1, removable, img);
    }

    /**
     * evaluate.
     */
    public evaluate():void{
        this.output_arr[0].value1 = this.input_arr[0].value1 + this.input_arr[1].value1;
        this.output_arr[0].value2 = this.input_arr[0].value2 + this.input_arr[1].value2;
    }
}

export{AddModule}