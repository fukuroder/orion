import {Input} from "./io/input"
import {Output} from "./io/output"
import {ControlModule} from "./module/controlModule"
import {DelayModule} from "./module/delayModule"
import {InputModule} from "./module/inputModule"
import {ModuleBase} from "./module/moduleBase"
import {OutputModule} from "./module/outputModule"
import {SampleRateModule} from "./module/sampleRateModule"

/**
 * キャンバスクラス.
 * @author fukuroda
 */
class ConnectionEditor{
    /**
     * TODO.
     */
    public drag_module:ModuleBase|null = null;

    /**
     * TODO.
     */
    public drag_module_offset_x:number=0;

    /**
     * TODO.
     */
    public drag_module_offset_y:number=0;

    /**
     * TODO.
     */
    public drag_module_prev_x:number=0;

    /**
     * TODO.
     */
    public drag_module_prev_y:number=0;

    /**
     * TODO.
     */
    public start:Output|null=null;

    /**
     * TODO.
     */
    public end:Input|null = null;

    /**
     * TODO.
     */
    private canvas:HTMLCanvasElement;

    /**
     * TODO.
     */
    private rendering_context:CanvasRenderingContext2D;

    /**
     * TODO.
     */
    private canvas_height:number;

    /**
     * TODO.
     */
    private canvae_width:number;

    /**
     * TODO.
     */
    public _original_module_arr:ModuleBase[] = [];

    /**
     * TODO.
     */
    public _module_arr:ModuleBase[] = [];

    /**
     * TODO.
     */
    public _ctrl_module_arr:ControlModule[] = [];

    /**
     * TODO.
     */
    public _input_module:InputModule|null = null;
    public _output_module:OutputModule|null = null;
    public _samplerate_module:SampleRateModule|null = null;
    public _module_seqence:ModuleBase[] = [];

    /**
     * TODO.
     */
    private tol:number = 10; // 移動？

    /**
     * constructor.
     * @param canvas
     */
    public constructor(canvas:HTMLCanvasElement){
        this.canvas = canvas;
        this.rendering_context = canvas.getContext("2d")!;
        this.canvas_height = canvas.height;
        this.canvae_width = canvas.width;
    }

    /**
     * ケーブルドラッグ開始.
     */
    public start_cable_drag(start:Output|null, end:Input|null ) {
        this.start = start;
        this.end = end;
    }

    /**
     * ケーブルの端取得.
     */
    public get_cable_point()
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
    public is_cable_dragging() {
        return (this.start != null || this.end != null);
    }

    /**
     * モジュールドラッグ開始.
     * @param module
     * @param offset_x
     * @param offset_y
     */
    public start_module_drag(module:ModuleBase, offset_x:number, offset_y:number):void{
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
    public end_module_drag(offset:any):void {
        this.drag_module!.move( offset.x - this.drag_module_offset_x, offset.y - this.drag_module_offset_y);
    }

    /**
     * モジュールの位置をドラッグ前に戻す.
     */
    public cancel_module_drag():void {
        this.drag_module!.move(this.drag_module_prev_x, this.drag_module_prev_y);
    }

    /**
     * モジュールの再描画.
     * @param modules
     */
    private redraw_modules(modules:ModuleBase[]):void {
        for ( var m of modules) {
            this.rendering_context.drawImage(m.image, m.x, m.y);
        }
    }

    /**
     * 背景描画
     */
    private drawBack():void{
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
    public drawLine(x1:number, y1:number, x2:number, y2:number, color:string = '#000000'):void{
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
    private drawText(align:string, q_bus_name:string, x:number, y:number, color:string = '#000000'):void {
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
        this.rendering_context.font = this.rendering_context.font.replace(/[0-9]+px /, '12px '); // -> 12px

        // 描画（自分）
        this.rendering_context.textAlign = align as CanvasTextAlign;
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
    private redraw_cables(module_arr:ModuleBase[]):void{
        for( var module of module_arr ){
            for( var output of module.output_arr ){
                var p1 = output.get_point();

                for( var next_input of output.next_input_arr ){
                    var p2 = next_input.get_point();
                    this.drawLine(p1.x, p1.y, p2.x, p2.y);
                }

                this.drawText('left', output.quick_bus_name, p1.x, p1.y);

                for( var quick_bus_next_input of output.quick_bus_next_input_arr ){
                    var p2 = quick_bus_next_input.get_point();
                    this.drawText('right', output.quick_bus_name, p2.x, p2.y);
                }
            }

            for( var input of module.input_arr ){
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
    public redraw():void {
        // 背景描画
        this.drawBack();

        // モジュールを描画
        this.redraw_modules(this._module_arr);
        this.redraw_modules(this._original_module_arr);

        // 接続中ケーブルを描画
        this.redraw_cables(this._module_arr);
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
     * 接続済みInput干渉チェック
     * @param offset
     * @param module_arr
     * @param tol
     */
    public getConnectedInput(offset:any):Input | null{
        // Module
        for( var module of this._module_arr){
            // Output
            for( var output of module.output_arr ){
                // Output先のInput
                for( var next_input of output.next_input_arr ){
                    var p = next_input.get_point();
                    if( this.squareDistance(p.x, p.y, offset.x, offset.y) < this.tol*this.tol ){
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
    public getConnectedInputQuickBus(offset:any, module_arr:ModuleBase[], tol:number):Input|null{
        // Module
        for( var module of module_arr ){
            // Output
            for( var output of module.output_arr ){
                // Output先のInput(QuickBus)
                for( var next_input of output.quick_bus_next_input_arr ){
                    var p = next_input.get_point();
                    if( this.squareDistance(p.x, p.y, offset.x, offset.y) < tol*tol ){
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
    public getHitModuleOutput( offset:any ):Output|null{
        for( var m of this._module_arr ){

            //---------------------------------
            // アウトプットコネクタ干渉チェック
            //---------------------------------
            var k = m.hit_test_with_output(offset, this.tol);
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
    public getHitModuleInput( offset:any ):Input|null{
        for( var m of this._module_arr ){

            //--------------------------------
            // インプットコネクタ干渉チェック
            //--------------------------------
            var k = m.hit_test_with_input(offset, this.tol);
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
    public getHitModule( offset:any ):ModuleBase|null{
        for( var m of this._module_arr ){

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
    public getHitModule2222( offset:any ):ModuleBase|null{
        for( var m of this._original_module_arr ){

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
    public getResisterdQuickBus(name:string):Output|null {
        for( var module of this._module_arr ){
            for( var output of module.output_arr ){
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
    public is_module_inside_view(big:boolean):boolean {
        if ( this.drag_module == null ) return false;

        var line_y:number = 0;
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

    public calc_module_order(){
        for( var module of this._module_arr ){
            for( var input of module.input_arr ){
                input.stream_updated = false;
            }
        }

        var module_seqence:ModuleBase[] = [];
        for ( var m of this._module_arr) {
            if ( m.name == 'delay_module' ) {
                var delay_m:DelayModule = m as DelayModule;
                module_seqence = module_seqence.concat(delay_m.delay_update());
            }
        }
        this._module_seqence = module_seqence.concat(this._input_module!.stream_update());
    }
}

export{ConnectionEditor}