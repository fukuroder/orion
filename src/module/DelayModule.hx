package module;
import js.html.Image;

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
    public function new(x:Int, y:Int, removable:Bool, img:Image){
        super('delay_module', x, y, 1, 1, removable, img);
        this.is_delay = true;
    }

    /**
     * evaluate.
     */
    override function evaluate():Void{
        this.output_arr[0].value1 = this.input_arr[0].value1 + 1.0e-100; // Denomal cancel
        this.output_arr[0].value2 = this.input_arr[0].value2 + 1.0e-100; // Denomal cancel
    }

    /**
     * 定数判定.
     * @return
     */
    override function is_constant():Bool{
        // 強制的にstream update扱いとする
        return false;
    }

    /**
     * stream更新.
     * @return
     */
    override function stream_update():Array<ModuleBase> {
        //------------------------
        // nextには進まずに止める
        //------------------------
        return [];
    }

    /**
     * Delayモジュール更新.
     * @return
     */
    public function delay_update():Array<ModuleBase>{
        // Output先のモジュールを更新する
        var order:Array<ModuleBase> = [this];
        for ( output in this.output_arr ) {
            // Output
            for( next_input in output.next_input_arr ){
                next_input.stream_updated = true;
                order = order.concat(next_input.module.stream_update());
            }

            // Output(QuickBus)
            for( next_input in output.quick_bus_next_input_arr ){
                next_input.stream_updated = true;
                order = order.concat(next_input.module.stream_update());
            }
        }
        return order;
    }
}

