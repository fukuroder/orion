import {ModuleBase} from "./moduleBase"

/**
 * delay module.
 * @author fukuroda
 */
class DelayModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public constructor(x:number, y:number, removable:boolean, img:HTMLImageElement){
        super('delay_module', x, y, 1, 1, removable, img);
        this.is_delay = true;
    }

    /**
     * evaluate.
     */
    public evaluate():void{
        this.output_arr[0].value1 = this.input_arr[0].value1 + 1.0e-100; // Denomal cancel
        this.output_arr[0].value2 = this.input_arr[0].value2 + 1.0e-100; // Denomal cancel
    }

    /**
     * 定数判定.
     * @return
     */
    public is_constant():boolean{
        // 強制的にstream update扱いとする
        return false;
    }

    /**
     * stream更新.
     * @return
     */
    public stream_update():ModuleBase[] {
        //------------------------
        // nextには進まずに止める
        //------------------------
        return [];
    }

    /**
     * Delayモジュール更新.
     * @return
     */
    public delay_update():ModuleBase[]{
        // Output先のモジュールを更新する
        var order:ModuleBase[] = [this];
        for ( var output of this.output_arr ) {
            // Output
            for( var next_input of output.next_input_arr ){
                next_input.stream_updated = true;
                order = order.concat(next_input.module.stream_update());
            }

            // Output(QuickBus)
            for( var next_input of output.quick_bus_next_input_arr ){
                next_input.stream_updated = true;
                order = order.concat(next_input.module.stream_update());
            }
        }
        return order;
    }
}

export{DelayModule}