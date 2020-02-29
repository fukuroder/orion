import {Input} from "../io/input"
import {Output} from "../io/output"

/**
 * module base.
 * @author fukuroda
 */
class ModuleBase {
    /**
     * TODO.
     */
    public name:string;

    /**
     * TODO.
     */
    public x:number;

    /**
     * TODO.
     */
    public y:number;

    /**
     * TODO.
     */
    public w:number;

    /**
     * TODO.
     */
    public h:number;

    /**
     * TODO.
     */
    public removable:boolean;

    /**
     * TODO.
     */
    public input_arr:Input[];

    /**
     * TODO.
     */
    public output_arr:Output[];

    /**
     * TODO.
     */
    protected is_delay:boolean;

    /**
     * TODO.
     */
    public image:HTMLImageElement;

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
    public constructor(name:string, x:number, y:number, num_in:number, num_out:number, removable:boolean, image:HTMLImageElement){
        this.name = name;
        this.x = x;
        this.y = y;
        this.w = image.width;
        this.h = image.height;
        this.input_arr = [];
        for( var i = 0; i<num_in; i++ ){
            this.input_arr.push( new Input(this, i) );
        }

        this.output_arr = [];
        for( var i=0; i<num_out; i++ ){
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
    private squareDistance(x1:number, y1:number, x2:number, y2:number):number{
        return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
    }

    /**
     * 定数か？.
     */
    public is_constant():boolean{
        return this.input_arr.every(input=>input.constant);
    }

    /**
     * 定数アップデート.
     * @param first
     */
    public constant_update(first:boolean):void{
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
        for ( var output of this.output_arr ) {
            // ケーブル接続

            // 次のInputを取得する
            for( var next_input of output.next_input_arr ){

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
            for( var next_input of output.quick_bus_next_input_arr ){
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
    public stream_update():ModuleBase[]{
        //-----------------------------------
        // 全Inputが準備OKかチェックする
        //-----------------------------------
        var order:ModuleBase[] = [];
        var update = this.input_arr.every(input=>input.constant || input.stream_updated); // 空もtrue
        if ( update == true) {

            order.push(this);

            //-----------------------------------------
            // 全Inputが準備OKならばOutputを更新する
            //-----------------------------------------
            //this.evaluate();

            // Output先のモジュールを更新する
            for( var output of this.output_arr ){
                for( var next_input of output.next_input_arr ){
                    // Output値をInput値に設定
                    //next_input.value1 = output.value1;
                    //next_input.value2 = output.value2;

                    // stream updateに更新する
                    next_input.stream_updated = true;

                    // 再帰呼出
                    order = order.concat(next_input.module.stream_update());
                }

                // QuickBus
                for( var next_input of output.quick_bus_next_input_arr ){
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
    public isLoop(prev_module:ModuleBase):boolean{
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

        for( var output of this.output_arr ){
            // ケーブル接続
            for( var next_input of output.next_input_arr ){
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
            for( var next_input of output.quick_bus_next_input_arr ){
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
    public get_input_point(index:number){
        var x:number = this.x;
        var interval_h:number = this.h / this.input_arr.length;
        var y:number = Math.round(this.y+(index+0.5)*interval_h);
        return { x:x, y:y };
    }

    /**
     * TODO.
     * @param index
     */
    public get_output_point(index:number){
        var x:number = this.x + this.w;
        var interval_h:number = this.h / this.output_arr.length;
        var y:number = Math.round(this.y+(index+0.5)*interval_h);
        return { x:x, y:y };
    }

    /**
     * インプットコネクタ干渉チェック.
     * @param offset
     * @param tol
     */
    public hit_test_with_input(offset:any, tol:number):number{
        if( this.input_arr.length > 0 ){
            var point_x:number = this.x;
            var interval_h:number = this.h / this.input_arr.length;
            for( var i = 0; i<this.input_arr.length; i++ ){
                var point_y:number = Math.round( this.y + (i + 0.5) * interval_h);
                if( this.squareDistance(point_x, point_y, offset.x, offset.y) < tol*tol ){
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
    public hit_test_with_output(offset:any, tol:number):number{
        if( this.output_arr.length > 0 ){
            var point_x:number = this.x + this.w;
            var interval_h:number = this.h / this.output_arr.length;
            for( var i=0; i<this.output_arr.length; i++ ){
                var point_y:number = Math.round(this.y + (i + 0.5) * interval_h);
                if( this.squareDistance(point_x, point_y, offset.x, offset.y) < tol*tol ){
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
    public hit_test_with_main(offset:any):boolean{
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
    public move(x:number, y:number):void{
        // 座標を更新
        this.x = x;
        this.y = y;
    }

    /**
     * モジュール削除.
     * @param module
     */
    public removeModule():void{
        for( var output of this.output_arr){
            // ケーブル接続を全解除
            output.disconnect();
            output.disconnect_quickbus();
        }

        for(var input of this.input_arr){
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
    public evaluate():void {
        // 継承先でoverrideすること！
    }
}

export {ModuleBase}