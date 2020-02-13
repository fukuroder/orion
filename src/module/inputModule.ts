package module;
import js.html.Image;

/**
 * input module.
 * @author fukuroda
 */
class InputModule extends ModuleBase {
    /**
     * 値1.
     */
    public var value1:Float;

    /**
     * 値2.
     */
    public var value2:Float;

    /**
     * constructor.
     * @param x X座標
     * @param y Y座標
     * @param removable 削除可能か？
     * @param img 画像
     */
    public function new (x:Int, y:Int, img:Image){
        super('input_module', x, y, 0, 1, false, img);
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
     * evaluate.
     */
    override function evaluate():Void{
        this.output_arr[0].value1 = this.value1;
        this.output_arr[0].value2 = this.value2;
    }

    /**
     * 定数か？
     * @return
     */
    override function is_constant():Bool{
        return false;
    }
}
