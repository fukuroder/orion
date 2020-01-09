package module;
import js.html.Image;

/**
 * sin_module.
 * @author fukuroda
 */
class SinModule extends ModuleBase {
    /**
     * コンストラクタ.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public function new(x:Int, y:Int, removable:Bool, img:Image){
        super('sin_module', x, y, 1, 1, removable, img);
    }

    /**
     * 評価.
     */
    override function evaluate():Void{
        this.output_arr[0].value1 = Math.sin(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.sin(this.input_arr[0].value2);
    }
}