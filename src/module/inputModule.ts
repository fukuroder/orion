import {ModuleBase} from "./moduleBase.js"

/**
 * input module.
 * @author fukuroda
 */
class InputModule extends ModuleBase {
    /**
     * 値1.
     */
    public value1:number;

    /**
     * 値2.
     */
    public value2:number;

    /**
     * constructor.
     * @param x X座標
     * @param y Y座標
     * @param removable 削除可能か？
     * @param img 画像
     */
    public constructor (x:number, y:number, img:HTMLImageElement){
        super('input_module', x, y, 0, 1, false, img);
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
        this.output_arr[0].value1 = this.value1;
        this.output_arr[0].value2 = this.value2;
    }

    /**
     * 定数か？
     * @return
     */
    public is_constant():boolean{
        return false;
    }
}

export{InputModule}