package module ;
import io.Input;
import io.Output;
import js.html.Image;

/**
 * module base.
 * @author fukuroda
 */
class ModuleBase {
    /**
     * TODO.
     */
    public var name:String;

    /**
     * TODO.
     */
    public var x:Int;

    /**
     * TODO.
     */
    public var y:Int;

    /**
     * TODO.
     */
    public var w:Int;

    /**
     * TODO.
     */
    public var h:Int;

    /**
     * TODO.
     */
    public var removable:Bool;

    /**
     * TODO.
     */
    public var input_arr:Array<Input>;

    /**
     * TODO.
     */
    public var output_arr:Array<Output>;

    /**
     * TODO.
     */
    private var is_delay:Bool;

    /**
     * TODO.
     */
    public var image:Image;

    /**
     * constructor.
     * @param name
     * @param x
     * @param y
     * @param num_in
     * @param num_out
     * @param removable
     * @param image
     */
    public function new(name:String, x:Int, y:Int, num_in:Int, num_out:Int, removable:Bool, image:Image){
        this.name = name;
        this.x = x;
        this.y = y;
        this.w = image.width;
        this.h = image.height;
        this.input_arr = [];
        for( i in 0...num_in ){
            this.input_arr.push( new Input(this, i) );
        }

        this.output_arr = [];
        for( i in 0...num_out ){
            this.output_arr.push( new Output(this, i) );
        }

        this.removable = removable;
        this.is_delay = false;
        this.image = image;
    }

    /**
     * 二乗距離.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @return 二乗距離
     */
    static function squareDistance(x1:Int, y1:Int, x2:Int, y2:Int):Int{
        return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
    }

    /**
     * 定数か？.
     */
    public function is_constant():Bool{
        return Lambda.foreach(this.input_arr, function(input) { return input.constant; });
    }

    /**
     * 定数アップデート.
     * @param first
     */
    public function constant_update(first:Bool):Void{
        if( this.is_delay == true && first == false){
            //-------------------------------------------
            // delay_moduleがあったら止める（初回は除く）
            //-------------------------------------------
            return;
        }

        var is_constant = this.is_constant();
        if(is_constant == true){
            //-----------------------------------------
            // 全Inputが準備OKならばOutputを更新する
            //-----------------------------------------
            this.evaluate();
        }

        // Output先のモジュールを更新する
        for ( output in this.output_arr ) {
            // ケーブル接続

            // 次のInputを取得する
            for( next_input in output.next_input_arr ){

                if(is_constant == true){
                    //--------------------------------------
                    // 自分が順OKなら次のInputの値を更新する
                    //--------------------------------------
                    next_input.value1 = output.value1;
                    next_input.value2 = output.value2;
                }

                // Inputの定数フラグを更新する（Outputと同じものを設定）
                next_input.constant = is_constant;

                // 次のmoduleの更新（再帰）
                next_input.module.constant_update(false/*初回以降*/);
            }

            // QuickBus接続

            // 次のInputを取得する
            for( next_input in output.quick_bus_next_input_arr ){
                if(is_constant == true){
                    //--------------------------------------
                    // 自分が順OKなら次のInputの値を更新する
                    //--------------------------------------
                    next_input.value1 = output.value1;
                    next_input.value2 = output.value2;
                }

                // Inputの定数フラグを更新する
                next_input.constant = is_constant;

                // 次のmoduleの更新（再帰）
                next_input.module.constant_update(false/*初回以降*/);
            }
        }
    }

    /**
     * TODO.
     */
    public function stream_update():Array<ModuleBase>{
        //-----------------------------------
        // 全Inputが準備OKかチェックする
        //-----------------------------------
        var order:Array<ModuleBase> = [];
        var update = Lambda.foreach(this.input_arr, function(input){ return (input.constant || input.stream_updated); }); // 空もtrue
        if ( update == true) {

            order.push(this);

            //-----------------------------------------
            // 全Inputが準備OKならばOutputを更新する
            //-----------------------------------------
            //this.evaluate();

            // Output先のモジュールを更新する
            for( output in this.output_arr ){
                for( next_input in output.next_input_arr ){
                    // Output値をInput値に設定
                    //next_input.value1 = output.value1;
                    //next_input.value2 = output.value2;

                    // stream updateに更新する
                    next_input.stream_updated = true;

                    // 再帰呼出
                    order = order.concat(next_input.module.stream_update());
                }

                // QuickBus
                for( next_input in output.quick_bus_next_input_arr ){
                    // Output値をInput値に設定
                    //next_input.value1 = output.value1;
                    //next_input.value2 = output.value2;

                    // stream updateに更新する
                    next_input.stream_updated = true;

                    // 再帰呼出
                    order = order.concat(next_input.module.stream_update());
                }
            }
        }
        return order;
    }

    /**
     * 接続前のループチェック.
     * @param prev_module
     */
    public function isLoop(prev_module:ModuleBase):Bool{
        //--------------------------------------------------------
        // thisから初めてprev_moduleに到達したらループと判定する
        // 但し、途中にdelay_moduleがある経路はループと判定しない
        //--------------------------------------------------------

        if( this.is_delay == true ){
            //----------------------
            // delay_moduleで止める
            //----------------------
            return false;
        }

        if( prev_module == this ){
            //-----------------------
            // prev_moduleに到達した
            //-----------------------
            return true;
        }

        for( output in this.output_arr ){
            // ケーブル接続
            for( next_input in output.next_input_arr ){
                // ループチェック（再帰）
                var loop = next_input.module.isLoop(prev_module);
                if( loop == true ){
                    //---------------------------------------
                    // prev_moduleに到達したのでチェック終了
                    //---------------------------------------
                    return true;
                }
            }

            // QuickBus接続
            for( next_input in output.quick_bus_next_input_arr ){
                // ループチェック（再帰）
                var loop = next_input.module.isLoop(prev_module);
                if( loop == true ){
                    //---------------------------------------
                    // prev_moduleに到達したのでチェック終了
                    //---------------------------------------
                    return true;
                }
            }
        }

        // prev_moduleに到達しなかった
        return false;
    }

    /**
     * TODO.
     * @param index
     */
    public function get_input_point(index:Int ){
        var x:Int = this.x;
        var interval_h:Float = this.h / this.input_arr.length;
        var y:Int = Math.round(this.y+(index+0.5)*interval_h);
        return { x:x, y:y };
    }

    /**
     * TODO.
     * @param index
     */
    public function get_output_point(index:Int){
        var x:Int = this.x + this.w;
        var interval_h:Float = this.h / this.output_arr.length;
        var y:Int = Math.round(this.y+(index+0.5)*interval_h);
        return { x:x, y:y };
    }

    /**
     * インプットコネクタ干渉チェック.
     * @param offset
     * @param tol
     */
    public function hit_test_with_input(offset, tol:Int):Int{
        if( this.input_arr.length > 0 ){
            var point_x:Int = this.x;
            var interval_h:Float = this.h / this.input_arr.length;
            for( i in 0...this.input_arr.length ){
                var point_y:Int = Math.round( this.y + (i + 0.5) * interval_h);
                if( squareDistance(point_x, point_y, offset.x, offset.y) < tol*tol ){
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * アウトプットコネクタ干渉チェック.
     * @param offset
     * @param tol
     */
    public function hit_test_with_output(offset, tol:Int):Int{
        if( this.output_arr.length > 0 ){
            var point_x:Int = this.x + this.w;
            var interval_h:Float = this.h / this.output_arr.length;
            for( i in 0...this.output_arr.length ){
                var point_y:Int = Math.round(this.y + (i + 0.5) * interval_h);
                if( squareDistance(point_x, point_y, offset.x, offset.y) < tol*tol ){
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * モジュール本体干渉チェック.
     * @param offset
     */
    public function hit_test_with_main(offset):Bool{
        if( this.x <= offset.x && offset.x <= this.x + this.w &&
            this.y <= offset.y && offset.y <= this.y + this.h ){
            return true;
        }
        else{
            return false;
        }
    }

    /**
     * モジュール移動（描画はしない）.
     * @param x
     * @param y
     */
    public function move(x:Int, y:Int):Void{
        // 座標を更新
        this.x = x;
        this.y = y;
    }

    /**
     * モジュール削除.
     * @param module
     */
    public function removeModule():Void{
        for( output in this.output_arr){
            // ケーブル接続を全解除
            output.disconnect();
            output.disconnect_quickbus();
        }

        for(input in this.input_arr){
            var prev_output = input.prev_output;
            if( prev_output != null ){
                var removed = prev_output.disconnect(input);

                if( removed == false ){
                    prev_output.disconnect_quickbus(input);
                }
            }
        }
    }

    /**
     * 数式評価（抽象）.
     * @return
     */
    public function evaluate():Void {
        // 継承先でoverrideすること！
    }
}
