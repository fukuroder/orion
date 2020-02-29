import {ModuleBase} from "./moduleBase"

/**
 * control module.
 * @author fukuroda
 */
class ControlModule extends ModuleBase {
    /**
     *
     */
    public value:number;

    /**
     *
     */
    public idx:number;

    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public constructor (x:number, y:number, img:HTMLImageElement, idx:number){
        super('control_module', x, y, 0, 1, false, img);
        this.value = 0.5;
        this.idx = idx;
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
        this.output_arr[0].value1 = this.value;
        this.output_arr[0].value2 = this.value;
    }
}

export{ControlModule}