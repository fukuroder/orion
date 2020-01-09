package io ;
import module.ModuleBase;

/**
 * Inputクラス.
 * @author fukuroda
 */
class Input extends IOBase {
    /**
     * 前のOutput.
     */
    public var prev_output:Output;

    /**
     * QuickConst名.
     */
    public var quick_const:String;

    /**
     * 定数か？.
     */
    public var constant:Bool;

    /**
     * TODO.
     */
    public var stream_updated:Bool;

    /**
     * コンストラクタ.
     * @param module
     * @param index
     */
    public function new(module:ModuleBase, index:Int){
        super(module, index);

        this.prev_output = null;
        this.constant = true;
        this.quick_const = '';
        this.stream_updated = false;
    }

    /**
     * 位置取得.
     */
    public function get_point(){
        return this.module.get_input_point(this.index);
    }

    /**
     * 接続.
     * @param output
     */
    public function connect_with_output(output:Output):Void{
        this.prev_output = output;
        this.value1 = output.value1;
        this.value2 = output.value2;
        this.constant = output.module.is_constant();
        this.module.constant_update(true);
    }

    /**
     * QuickConst更新.
     * @param quick_const
     * @param value
     */
    public function update_quick_const(quick_const:String, value:Float):Void{
        this.quick_const = quick_const;
        this.value1 = value;
        this.value2 = value;
        this.module.constant_update(true);
    }

    /**
     * 切断.
     */
    public function disconnect_with_output():Void{
        this.prev_output = null;
        this.value1 = 0.0;
        this.value2 = 0.0;
        this.constant = true;
        this.module.constant_update(true);
    }
}

