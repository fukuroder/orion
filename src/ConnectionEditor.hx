package ;
import js.html.CanvasElement;
import js.html.CanvasRenderingContext2D;
import io.Input;
import io.Output;
import module.ControlModule;
import module.DelayModule;
import module.InputModule;
import module.ModuleBase;
import module.OutputModule;
import module.SampleRateModule;

/**
 * キャンバスクラス.
 * @author fukuroda
 */
class ConnectionEditor{
    /**
     * TODO.
     */
    public var drag_module:ModuleBase;

    /**
     * TODO.
     */
    public var drag_module_offset_x:Int;

    /**
     * TODO.
     */
    public var drag_module_offset_y:Int;

    /**
     * TODO.
     */
    public var drag_module_prev_x:Int;

    /**
     * TODO.
     */
    public var drag_module_prev_y:Int;

    /**
     * TODO.
     */
    public var start:Output;

    /**
     * TODO.
     */
    public var end:Input;

    /**
     * TODO.
     */
    private var canvas:CanvasElement;

    /**
     * TODO.
     */
    private var rendering_context:CanvasRenderingContext2D;

    /**
     * TODO.
     */
    private var canvas_height:Int;

    /**
     * TODO.
     */
    private var canvae_width:Int;

    /**
     * TODO.
     */
    public var _original_module_arr:Array<ModuleBase> = [];

    /**
     * TODO.
     */
    public var _module_arr:Array<ModuleBase> = [];

    /**
     * TODO.
     */
    public var _ctrl_module_arr:Array<ControlModule> = [];

    /**
     * TODO.
     */
    public var _input_module:InputModule;
    public var _output_module:OutputModule;
    public var _samplerate_module:SampleRateModule;
    public var _module_seqence:Array<ModuleBase> = [];

    /**
     * TODO.
     */
    var tol:Int = 10; // 移動？

    /**
     * コンストラクタ.
     * @param canvas
     */
    public function new(canvas:CanvasElement){
        this.canvas = canvas;
        this.rendering_context = canvas.getContext2d();
        this.canvas_height = canvas.height;
        this.canvae_width = canvas.width;
    }

    /**
     * ケーブルドラッグ開始.
     */
    public function start_cable_drag(start:Output, end:Input ) {
        this.start = start;
        this.end = end;
    }

    /**
     * ケーブルの端取得.
     */
    public function get_cable_point()
    {
        if( this.start != null ){
            return this.start.get_point();
        }
        else if( this.end != null ){
            return this.end.get_point();
        }
        return null;
    }

    /**
     *
     */
    public function is_cable_dragging() {
        return (this.start != null || this.end != null);
    }

    /**
     * モジュールドラッグ開始.
     * @param module
     * @param offset_x
     * @param offset_y
     */
    public function start_module_drag(module:ModuleBase, offset_x:Int, offset_y:Int):Void{
        this.drag_module = module;
        this.drag_module_offset_x = offset_x - module.x;
        this.drag_module_offset_y = offset_y - module.y;
        this.drag_module_prev_x = module.x;
        this.drag_module_prev_y = module.y;
    }

    /**
     * モジュールドラッグ終了.
     * @param offset
     */
    public function end_module_drag(offset):Void {
        this.drag_module.move( offset.x - this.drag_module_offset_x, offset.y - this.drag_module_offset_y);
    }

    /**
     * モジュールの位置をドラッグ前に戻す.
     */
    public function cancel_module_drag():Void {
        this.drag_module.move(this.drag_module_prev_x, this.drag_module_prev_y);
    }

    /**
     *　モジュールの再描画.
     * @param modules
     */
    function redraw_modules(modules:Array<ModuleBase>):Void {
        for ( m in modules) {
            rendering_context.drawImage(m.image, m.x, m.y);
        }
    }

    /**
     * 背景描画
     */
    function drawBack():Void{
        // クリア
        this.rendering_context.clearRect(0, 0, this.canvae_width, this.canvas_height);

        // 枠
        this.rendering_context.beginPath();
        this.rendering_context.lineWidth = 2;
        this.rendering_context.strokeStyle='#000000';
        this.rendering_context.moveTo(0, 0);
        this.rendering_context.lineTo(this.canvae_width-1, 0);
        this.rendering_context.lineTo(this.canvae_width-1, this.canvas_height-1);
        this.rendering_context.lineTo(0, this.canvas_height-1);
        this.rendering_context.lineTo(0, 0);

        this.rendering_context.moveTo(0, 50);
        this.rendering_context.lineTo(this.canvae_width-1, 50);
        this.rendering_context.stroke();
    }

    /**
     * 直線描画.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @param color
     */
    public function drawLine(x1:Int, y1:Int, x2:Int, y2:Int, color:String = '#000000'):Void{
        this.rendering_context.beginPath();
        this.rendering_context.lineWidth = 1;
        this.rendering_context.strokeStyle = color;
        this.rendering_context.moveTo(x1, y1);
        this.rendering_context.lineTo(x2, y2);
        this.rendering_context.stroke();
    }

    /**
     * 文字列描画.
     * @param ctx
     * @param align
     * @param q_bus_name
     * @param x
     * @param y
     * @param color
     */
    function drawText(align:String, q_bus_name:String, x:Int, y:Int, color:String = '#000000'):Void {
        if( q_bus_name == '' ) return;

        this.rendering_context.beginPath();
        this.rendering_context.lineWidth = 1;
        this.rendering_context.strokeStyle=color;
        this.rendering_context.moveTo(x, y);
        if( align=='left' ){
            this.rendering_context.lineTo(x+5, y);
        }
        else{
            this.rendering_context.lineTo(x-5, y);
        }
        this.rendering_context.stroke();

        // フォント設定
        this.rendering_context.fillStyle = color;
        this.rendering_context.font = ~/[0-9]+px /.replace( this.rendering_context.font, '12px '); // -> 12px

        // 描画（自分）
        this.rendering_context.textAlign = align;
        if( align=='left' ){
            this.rendering_context.fillText(q_bus_name, x+7, y + 3);
        }
        else{
            this.rendering_context.fillText(q_bus_name, x-7, y + 3);
        }
    }

    /**
     * 接続中のケーブルを描画
     * @param module_arr
     */
    function redraw_cables(module_arr:Array<ModuleBase>):Void{
        for( module in module_arr ){
            for( output in module.output_arr ){
                var p1 = output.get_point();

                for( next_input in output.next_input_arr ){
                    var p2 = next_input.get_point();
                    this.drawLine(p1.x, p1.y, p2.x, p2.y);
                }

                this.drawText('left', output.quick_bus_name, p1.x, p1.y);

                for( quick_bus_next_input in output.quick_bus_next_input_arr ){
                    var p2 = quick_bus_next_input.get_point();
                    this.drawText('right', output.quick_bus_name, p2.x, p2.y);
                }
            }

            for( input in module.input_arr ){
                var p2 = input.get_point();
                this.drawText('right', input.quick_const, p2.x, p2.y);
            }
        }
    }

    /**
     *
     * @param    placed_modules
     * @param    original_modules
     */
    public function redraw():Void {
        // 背景描画
        this.drawBack();

        // モジュールを描画
        this.redraw_modules(_module_arr);
        this.redraw_modules(_original_module_arr);

        // 接続中ケーブルを描画
        this.redraw_cables(_module_arr);
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
     * 接続済みInput干渉チェック
     * @param offset
     * @param module_arr
     * @param tol
     */
    public function getConnectedInput(offset):Input{
        // Module
        for( module in _module_arr ){
            // Output
            for( output in module.output_arr ){
                // Output先のInput
                for( next_input in output.next_input_arr ){
                    var p = next_input.get_point();
                    if( squareDistance(p.x, p.y, offset.x, offset.y) < tol*tol ){
                        return next_input;
                    }
                }
            }
        }
        return null;
    }

    /**
     * 接続済みInput干渉チェック
     * @param offset
     * @param module_arr
     * @param tol
     */
    public function getConnectedInputQuickBus(offset, module_arr:Array<ModuleBase>, tol):Input{
        // Module
        for( module in module_arr ){
            // Output
            for( output in module.output_arr ){
                // Output先のInput(QuickBus)
                for( next_input in output.quick_bus_next_input_arr ){
                    var p = next_input.get_point();
                    if( squareDistance(p.x, p.y, offset.x, offset.y) < tol*tol ){
                        return next_input;
                    }
                }
            }
        }
        return null;
    }

    /**
     * 未接続コネクタ・モジュール本体干渉チェック
     * @param offset
     * @param module_arr
     * @param tol
     */
    public function getHitModuleOutput( offset ):Output{
        for( m in _module_arr ){

            //---------------------------------
            // アウトプットコネクタ干渉チェック
            //---------------------------------
            var k = m.hit_test_with_output(offset, tol);
            if( k >= 0 ){
                //-----------------------------
                // アウトプットコネクタと干渉
                //-----------------------------
                return m.output_arr[k];
            }
        }
        return null;
    }

    /**
     * 未接続コネクタ・モジュール本体干渉チェック
     * @param offset
     * @param module_arr
     * @param tol
     */
    public function getHitModuleInput( offset ):Input{
        for( m in _module_arr ){

            //--------------------------------
            // インプットコネクタ干渉チェック
            //--------------------------------
            var k = m.hit_test_with_input(offset, tol);
            if( k >= 0 ){
                //--------------------------
                // インプットコネクタと干渉
                //--------------------------
                return m.input_arr[k];
            }
        }
        return null;
    }

    /**
     * 未接続コネクタ・モジュール本体干渉チェック
     * @param offset
     * @param module_arr
     * @param tol
     */
    public function getHitModule( offset ):ModuleBase{
        for( m in _module_arr ){

            //----------------------------
            // モジュール本体干渉チェック
            //----------------------------
            if( m.hit_test_with_main(offset) == true ){
                //----------------------
                // モジュール本体と干渉
                //----------------------
                return m;
            }
        }
        return null;
    }

        /**
     * 未接続コネクタ・モジュール本体干渉チェック
     * @param offset
     * @param module_arr
     * @param tol
     */
    public function getHitModule2222( offset ):ModuleBase{
        for( m in _original_module_arr ){

            //----------------------------
            // モジュール本体干渉チェック
            //----------------------------
            if( m.hit_test_with_main(offset) == true ){
                //----------------------
                // モジュール本体と干渉
                //----------------------
                return m;
            }
        }
        return null;
    }


    /**
     * 登録済みのQuickBusを取得する
     * @param module_arr
     * @param name
     */
    public function getResisterdQuickBus(name:String):Output {
        for( module in _module_arr ){
            for( output in module.output_arr ){
                if( name == output.quick_bus_name ){
                    return output;
                }
            }
        }
        return null;
    }

    /**
     * モジュールがview内にいるかチェック
     * @param view_w
     * @param view_h
     * @param module
     * @param big
     */
    public function is_module_inside_view(big:Bool):Bool {
        if ( this.drag_module == null ) return false;

        var line_y:Int = 0;
        if(  big == false ){
            line_y = 50;
        }

        if( 0 <= this.drag_module.x && this.drag_module.x + this.drag_module.w < this.canvae_width
         && line_y <= this.drag_module.y && this.drag_module.y + this.drag_module.h < this.canvas_height ){
            return true;
        }
        else{
            return false;
        }
    }

    public function calc_module_order(){
        for( module in _module_arr ){
            for( input in module.input_arr ){
                input.stream_updated = false;
            }
        }

        var module_seqence:Array<ModuleBase> = [];
        for ( m in this._module_arr) {
            if ( m.name == 'delay_module' ) {
                var delay_m:DelayModule = cast m;
                module_seqence = module_seqence.concat(delay_m.delay_update());
            }
        }
        this._module_seqence = module_seqence.concat(this._input_module.stream_update());
    }
}
