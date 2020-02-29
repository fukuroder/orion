import {ModuleBase} from "./moduleBase"

/**
 * output module.
 * @author fukuroda
 */
class OutputModule extends ModuleBase {
    /**
     * 値1.
     */
    public value1:number;

    /**
     * 値2.
     * */
    public value2:number;

    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public constructor (x:number, y:number, img:HTMLImageElement){
        super('output_module', x, y, 1, 0, false, img);
        this.value1 = 0.0;
        this.value2 = 0.0;
    }

    /**
     * 移動.
     * @param x
     * @param y
     */
    public move(x:number, y:number):void {
        // 上下の移動のみ
        this.y = y;
    }

    /**
     * evaluate.
     */
    public evaluate():void{
        this.value1 = this.input_arr[0].value1;
        this.value2 = this.input_arr[0].value2;
    }
}

export{OutputModule}