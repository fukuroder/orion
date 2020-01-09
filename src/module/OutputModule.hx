package module;
import js.html.Image;

/**
 * output_module.
 * @author fukuroda
 */
class OutputModule extends ModuleBase {
    /**
     * 値1.
     */
    public var value1:Float;

    /**
     * 値2.
     * */
    public var value2:Float;

    /**
     * コンストラクタ.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public function new (x:Int, y:Int, img:Image){
        super('output_module', x, y, 1, 0, false, img);
        this.value1 = 0.0;
        this.value2 = 0.0;
    }

    /**
     * 移動.
     * @param x
     * @param y
     */
    override function move(x:Int, y:Int):Void {
        // 上下の移動のみ
        this.y = y;
    }

    /**
     * 評価.
     */
    override function evaluate():Void{
        this.value1 = this.input_arr[0].value1;
        this.value2 = this.input_arr[0].value2;
    }
}
