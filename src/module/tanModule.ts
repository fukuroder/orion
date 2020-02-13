package module;
import js.html.Image;

/**
 * tan module.
 * @author fukuroda
 */
class TanModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public function new(x:Int, y:Int, removable:Bool, img:Image){
        super('tan_module', x, y, 1, 1, removable, img);
    }

    /**
     * evaluate.
     */
    override function evaluate():Void{
        this.output_arr[0].value1 = Math.tan(this.input_arr[0].value1);
        this.output_arr[0].value2 = Math.tan(this.input_arr[0].value2);
    }
}
