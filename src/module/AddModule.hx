package module;
import js.html.Image;

/**
 * add_module.
 * @author fukuroda
 */
class AddModule extends ModuleBase {
    /**
     * コンストラクタ.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public function new(x:Int, y:Int, removable:Bool, img:Image) {
        super('add_module', x, y, 2, 1, removable, img);
    }

    /**
     * 評価.
     */
    override function evaluate():Void{
        this.output_arr[0].value1 = this.input_arr[0].value1 + this.input_arr[1].value1;
        this.output_arr[0].value2 = this.input_arr[0].value2 + this.input_arr[1].value2;
    }
}

