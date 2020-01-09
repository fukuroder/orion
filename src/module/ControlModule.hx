package module;
import js.html.Image;

/**
 * control_module.
 * @author fukuroda
 */
class ControlModule extends ModuleBase {
    /** */
    public var value:Float;

    public var idx:Int;

    /**
     * コンストラクタ.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public function new (x:Int, y:Int, img:Image, idx:Int){
        super('control_module', x, y, 0, 1, false, img);
        this.value = 0.5;
        this.idx = idx;
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
        this.output_arr[0].value1 = this.value;
        this.output_arr[0].value2 = this.value;
    }
}
