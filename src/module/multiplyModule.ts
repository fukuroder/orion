package module;
import js.html.Image;

/**
 * multiply module.
 * @author fukuroda
 */
class MultiplyModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public function new(x:Int, y:Int, removable:Bool, img:Image){
        super('multiply_module', x, y, 2, 1, removable, img);
    }

    /**
     * evaluate.
     */
    override function evaluate():Void{
        this.output_arr[0].value1 = this.input_arr[0].value1 * this.input_arr[1].value1;
        this.output_arr[0].value2 = this.input_arr[0].value2 * this.input_arr[1].value2;
    }
}

