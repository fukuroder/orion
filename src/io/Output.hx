package io ;
import module.ModuleBase;

/**
 * ...
 * @author fukuroda
 */
class Output extends IOBase{
    /**
     * TODO.
     */
    public var next_input_arr:Array<Input>;

    /**
     * TODO.
     */
    public var quick_bus_name:String;

    /**
     * TODO.
     */
    public var quick_bus_next_input_arr:Array<Input>;

    /**
     * コンストラクタ.
     * @param module
     * @param index
     */
    public function new(module:ModuleBase, index:Int){
        super(module, index);
        this.next_input_arr = [];
        this.quick_bus_name = '';           // QuickBus名
        this.quick_bus_next_input_arr = []; // QuickBus接続先
    }

    /**
     * 位置取得.
     */
    public function get_point(){
        return this.module.get_output_point(this.index);
    }

    /**
     * 接続
     * @param input
     */
    public function connect(input:Input):Void{
        input.connect_with_output(this);
        this.next_input_arr.push(input);
    }

    /**
     * 接続
     * @param input
     */
    public function connect_quickbus(input:Input):Void{
        input.connect_with_output(this);
        this.quick_bus_next_input_arr.push(input);
    }

    /**
     * 切断
     * @param input
     */
    public function disconnect(input:Input = null):Bool{
        if( input == null ){
            //------------------------
            // 引数無しの場合は全削除
            //------------------------
            for ( input in this.next_input_arr) { input.disconnect_with_output(); }
            untyped __js__('this.next_input_arr.length = 0'); // TODO:
            return true;
        }

        var removeIndex:Int = this.next_input_arr.indexOf(input);
        if( removeIndex >= 0 ){
            input.disconnect_with_output();
            this.next_input_arr.remove(input);
            return true;
        }

        return false;
    }

    /**
     * 切断
     * @param input
     */
    public function disconnect_quickbus(input:Input = null):Bool{
        if( input == null ){
            //------------------------
            // 引数無しの場合は全削除
            //------------------------
            for( input in this.quick_bus_next_input_arr ){ input.disconnect_with_output(); }
            untyped __js__('this.quick_bus_next_input_arr.length = 0'); // TODO:
            this.quick_bus_name = "";

            return true;
        }

        var removeIndex = this.quick_bus_next_input_arr.indexOf(input);
        if( removeIndex >= 0 ){
            input.disconnect_with_output();
            this.quick_bus_next_input_arr.remove(input);

            return true;
        }
        return false;
    }
}
