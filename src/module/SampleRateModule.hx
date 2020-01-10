package module;
import js.html.Image;

/**
 * samplerate module.
 * @author fukuroda
 */
class SampleRateModule extends ModuleBase {
    /**
     * constructor.
     * @param x
     * @param y
     * @param removable
     * @param canvas_context
     * @param img
     */
    public function new(x:Int, y:Int, img:Image){
        super('samplerate_module', x, y, 0, 1, removable, img);
    }

    /**
     * 移動.
     * @param x
     * @param y
     */
    override function move(x:Int, y:Int):Void {
        // 上下の移動のみとする
        this.y = y;
    }
}
