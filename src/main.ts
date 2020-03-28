import {AudioFileReader} from "./audioFileReader"
import {AudioProcessor} from "./audioProcessor"
import {AudioWriter} from "./audioWriter"
import {ConnectionEditor} from "./connectionEditor"
import {ImageLoader} from "./imageLoader"
import {Input} from "./io/input"
import {Output} from "./io/output"
import {JsonConverter} from "./jsonConverter"
import {ModuleBase} from "./module/moduleBase"
import {ModuleCreator} from "./moduleCreator"
import {RecentLoader} from "./recentLoader"
import { InputModule } from "./module/inputModule"
import { OutputModule } from "./module/outputModule"
import { ControlModule } from "./module/controlModule"
import { SampleRateModule } from "./module/sampleRateModule"

/**
 * メイン.
 * @author fukuroda
 */
class Main {
    /**
     * TODO:
     */
    private static _audio_context:AudioContext;

    /**
     * TODO:
     */
    private static _display_prompt:boolean = false;

    /**
     * TODO:
     */
    private static _moved:boolean = false;

    /**
     * TODO:
     */
    private static _edit:boolean = false;

    /**
     * TODO:
     */
    private static _decodedBuffer:AudioBuffer;

    /**
     * TODO:
     */
    private static _button_clear:HTMLElement;

    /**
     * TODO:
     */
    private static _button_commit:HTMLElement;
    
    /**
     * TODO:
     */
    private static _text_midi_msg:HTMLElement;

    /**
     * TODO:
     */
    private static _button_ctrl1:HTMLElement;

    /**
     * TODO:
     */
    private static _button_ctrl2:HTMLElement;

    /**
     * TODO:
     */
    private static _button_ctrl3:HTMLElement;
    
    /**
     * TODO:
     */
    private static _button_learn1:HTMLElement;

    /**
     * TODO:
     */
    private static _button_learn2:HTMLElement;

    /**
     * TODO:
     */
    private static _button_learn3:HTMLElement;

    /**
     * TODO:
     */
    private static _current_midi_msg:Number;

    /**
     * TODO:
     */
    private static _midi_learn1:Number = -1;

    /**
     * TODO:
     */
    private static _midi_learn2:Number = -1;

    /**
     * TODO:
     */
    private static _midi_learn3:Number = -1;
    
    /**
     * TODO:
     */
    private static _button_revert:HTMLElement;

    /**
     * TODO:
     */
    private static _recent_backward:HTMLElement;

    /**
     * TODO:
     */
    private static _recent_forward:HTMLElement;

    /**
     * TODO:
     */
    private static _recent_load:HTMLElement;

    /**
     * TODO:
     */
    private static _recent_range:HTMLElement;

    /**
     * TODO:
     */
    private static _select_recent:HTMLSelectElement;

    /**
     * TODO:
     */
    private static _slider_ctrl1:HTMLInputElement;

    /**
     * TODO:
     */
    private static _slider_ctrl2:HTMLInputElement;

    /**
     * TODO:
     */
    private static _slider_ctrl3:HTMLInputElement;

    /**
     * TODO:
     */
    private static _slider_volume:HTMLInputElement;

    /**
     * TODO:
     */
    private static _text_ctrl1:HTMLElement;

    /**
     * TODO:
     */
    private static _text_ctrl2:HTMLElement;

    /**
     * TODO:
     */
    private static _text_ctrl3:HTMLElement;

    /**
     * TODO:
     */
    private static _text_volume:HTMLElement;

    /**
     * TODO:
     */
    private static _wave_file:HTMLElement;

    /**
     * TODO:
     */
    private static _wave_play:HTMLInputElement;

    /**
     * TODO:
     */
    private static _wave_save:HTMLElement;

    /**
     * TODO:
     */
    private static _work_view:HTMLCanvasElement;

    /**
     * TODO:
     */
    private static _canvas:ConnectionEditor;

    /**
     * TODO:
     */
    private static _audio_processor:AudioProcessor;

    /**
     * TODO:
     */
    private static _recent_loader:RecentLoader;

    /**
     * TODO:
     */
    private static _audio_file_loader:AudioFileReader;

    /**
     * TODO:
     */
    private static _module_creator:ModuleCreator;

    /**
     * 二乗距離.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @return 二乗距離
     */
    private static squareDistance(x1:number, y1:number, x2:number, y2:number):number{
        return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
    }

    /**
     * キャンバス左上基準の座標を取得する.
     * @param e TODO:
     * @return
     */
    private static getOffset(e:MouseEvent){
        var target = e.target as HTMLElement;

        //----------------------------------
        // FirefoxはOffsetX,OffsetYが未定義
        //----------------------------------
        return {x:e.pageX-target.offsetLeft, y:e.pageY-target.offsetTop};
    }

    /**
     * スライダーのmin,max,stepを変更する.
     * @param slider
     */
    private static editSlider(slider:HTMLInputElement):boolean{
        do{
            // プロンプト表示
            var str = prompt('Input min, max, step.', slider.getAttribute('min') + ', ' + slider.getAttribute('max') + ', ' + slider.getAttribute('step'));
            if( str == null ){
                // 編集キャンセル
                return false;
            }

            if ( str == '' ) {
                // 空の場合はでデフォルト値に更新
                slider.setAttribute('min', '0.0');
                slider.setAttribute('max', '1.0');
                slider.setAttribute('step', '0.01');
                slider.value = '0.5';
            }
            else{
                // split
                var str_split = str.split(',');
                if( str_split.length != 3 ){
                    // フォーマット不正のためやり直し
                    continue;
                }
                var min_str = str_split[0];
                var max_str = str_split[1];
                var step_str = str_split[2];

                // parse
                // （prompt入力のため厳しくparseする）
                var min:number = Number(min_str);
                var max:number = Number(max_str);
                var step:number = Number(step_str);

                // parseに成功しているかチェック
                if( isNaN(min) || isNaN(max) || isNaN(step) ){
                    // やり直し
                    continue;
                }

                // 最小値＜最大値になっているかチェック
                if( min >= max ){
                    // やり直し
                    continue;
                }

                // ステップが負になっていないかチェック
                if( step <= 0.0 ){
                    // やり直し
                    continue;
                }

                // valueをmin-maxの間にする
                var value:number = parseFloat( slider.value );
                if( value < min ){
                    value = min;
                }
                else if( max < value ){
                    value = max;
                }

                // min,max,step更新
                slider.setAttribute('min', min.toString());
                slider.setAttribute('max', max.toString());
                slider.setAttribute('step', step.toString());

                // value更新
                slider.value = value.toString();
            }
            break;
        }while(true);

        // テキスト更新
        slider.dispatchEvent(new Event('input'));
        return true;
    }

    /**
     * TODO:
     */
    private static Modified():void{
        if( Main._edit == false ){
            Main._button_commit.removeAttribute('disabled');
            Main._button_revert.removeAttribute('disabled');
            Main._button_clear.removeAttribute('disabled');
            Main._edit = true;
        }
    }

    /**
     * モジュール削除確認.
     */
    private static confirm_removing_module():void{
        //--------------------------------
        // モジュールがキャンバス外に出た
        //--------------------------------
        var delete_ok:boolean = false;
        if( Main._canvas.drag_module!.removable == true ){

            // プロンプト表示
            Main._display_prompt = true; // ガード
            delete_ok = confirm('May the module be deleted?');
            Main._display_prompt = false; // ガード
        }

        if( delete_ok == true ){
            // モジュールを削除する
            Main._canvas._module_arr.pop()!.removeModule();// ドラッグ中のモジュールは最後に入ってる

            Main._canvas.calc_module_order();
        }
        else{
            // モジュール位置をドラッグ開始位置に戻す
            Main._canvas.cancel_module_drag();
        }
    }

    /**
     *
     * @param input
     */
    private static quick_edit_input(input:Input):void{
        var org_busName:string = ''
        if( input.quick_const != '' ){
            org_busName = input.quick_const;
        }
        else if( input.prev_output != null ){
            org_busName = input.prev_output.quick_bus_name;
        }

        // QuickBus/QuickConst入力のプロンプト表示
        Main._display_prompt = true; // ガード
        var q_bus_or_const_name:string = prompt('Input QuickBus or QuickConst.',  org_busName)!;
        Main._display_prompt = false; // ガード

        if( q_bus_or_const_name != null && q_bus_or_const_name != org_busName){
            //--------------
            // Cancelでない
            //--------------
            if( q_bus_or_const_name == '' ){
                //--------------
                // 空文字の場合
                //--------------

                // QuickConst切断
                input.update_quick_const('', 0.0);

                if( input.prev_output != null ){
                    // QuickQus切断
                    input.prev_output.disconnect_quickbus(input);
                }
            }
            else{
                //------------------
                // 空文字でない場合
                //------------------

                var q_const:number = Number(q_bus_or_const_name);
                if( isNaN(q_const) == false ){
                    //-----------------------
                    // Parse成功→QuickConst
                    //-----------------------

                    if( input.prev_output != null ){
                        // QuickQus切断
                        input.prev_output.disconnect_quickbus(input);
                    }

                    // QuickConst更新
                    input.update_quick_const(q_bus_or_const_name, q_const);


                }
                else{

                    //---------------------
                    // Parse失敗→QuickBus
                    //---------------------

                    // QuickConst切断
                    input.update_quick_const('', 0.0);

                    // 使用済みの名前かチェック
                    var new_output:Output|null = Main._canvas.getResisterdQuickBus(q_bus_or_const_name);
                    if( new_output != null ){
                        //----------------
                        // 登録済みの場合
                        //----------------

                        // 接続を解除する
                        if( input.prev_output != null ){
                            input.prev_output.disconnect_quickbus(input);
                        }

                        if( input.module.isLoop(new_output.module) ){
                            alert('A recursive loop was detected.');
                        }
                        else{
                            // 次のinputとして追加する
                            new_output.connect_quickbus(input);
                        }
                    }
                    else{
                        //----------------
                        // 登録済みでない
                        //----------------

                        alert('The input name is not registered as QuickBus.');
                    }
                }
            }

            //
            Main._canvas.calc_module_order();
        }
    }

    /**
     *
     * @param output
     */
    private static quick_edit_output(output:Output):void{
         //----------------------------------------------------------------------
        // mousedown時の位置と同じ場合はQuickBus入力のプロンプト表示
        //----------------------------------------------------------------------
        Main._display_prompt = true;
        var q_bus_name:string = prompt('Input QuickBus.', output.quick_bus_name)!;
        Main._display_prompt = false;

        if( q_bus_name != null && q_bus_name != output.quick_bus_name ){
            //----------
            // 変更あり
            //----------
            if( q_bus_name == '' ){
                //--------------
                // 空文字の場合
                //--------------

                // 全部切断
                output.disconnect_quickbus();

            }
            else{

                var q_const:number = Number(q_bus_name);
                if( isNaN(q_const) ){

                    //-------------
                    // 数字でない場合
                    //-------------

                    // 使用済みの名前かチェック
                    var used_output:Output|null = Main._canvas.getResisterdQuickBus(q_bus_name);
                    if( used_output != null ){
                        //----------
                        // 使用済み
                        //----------
                        alert('The input name has been already registered as QuickBus.');
                    }
                    else{
                        //----------------
                        // 使用済みでない
                        //----------------
                        // QuickBus名を設定（※名前のみ変更で接続情報はのまままで良い）
                        output.quick_bus_name = q_bus_name;
                    }
                }
                else{
                    // QuickBus名が不正
                    alert('The input name has an error as QuickBus.');
                }
            }

            Main._canvas.calc_module_order();
        }
    }

    /**
     *
     * @param e
     */
    private static mousedown(e:any):void{
        if( e.button != 0 ){
            //-----------------------------
            // 右ボタン(0)以外は何もしない
            //-----------------------------
            return;
        }

        Main._moved = false;

        // キャンバス左上基準の座標を取得する
        var offset = Main.getOffset(e);

        // 接続済みコネクタ干渉チェック
        var connected_input:Input|null = Main._canvas.getConnectedInput( offset );

        if( connected_input != null ){
            //--------------------------------------
            // ケーブルが既に繋がっていた場合
            // →終点側をクリアして編集中扱いとする
            //--------------------------------------

            // Output取得
            var output:Output = connected_input.prev_output!;

            // 切断
            output.disconnect(connected_input);

            Main._canvas.calc_module_order();

            // ケーブルインスタンス生成
            Main._canvas.start_cable_drag(output, null /*終点未定*/);

            Main._moved = true;
        }
        else{
            //--------------------------------------------
            // 未接続コネクタ・モジュール本体干渉チェック
            //-------------------------------------------
            var input:Input|null = Main._canvas.getHitModuleInput( offset );
            if( input != null ){
                //--------------------------
                // インプットコネクタと干渉
                //--------------------------
                Main._canvas.start_cable_drag(null, input);
            }
            else{
                var output:Output|null = Main._canvas.getHitModuleOutput( offset );
                if( output != null ){
                    //----------------------------
                    // アウトプットコネクタと干渉
                    //----------------------------
                    Main._canvas.start_cable_drag(output, null);
                }
                else{
                    var module:ModuleBase|null = Main._canvas.getHitModule( offset );
                    if( module != null ){
                        //----------------------
                        // モジュール本体と干渉
                        //----------------------

                        // 最上位に描画されるように移動
                        Main._canvas._module_arr.splice(Main._canvas._module_arr.indexOf(module), 1);
                        Main._canvas._module_arr.push(module);

                        // ドラッグ位置を保持
                        Main._canvas.start_module_drag(module, offset.x, offset.y);
                    }
                    else{
                        var original_module:ModuleBase|null = Main._canvas.getHitModule2222( offset );
                        if( original_module != null ){
                            // ドラッグ位置を保持
                            Main._canvas.start_module_drag(original_module, offset.x, offset.y);
                        }
                    }
                }
            }

            Main._moved = false;
        }
    }

    /**
     *
     * @param e
     */
    private static mousemove(e:any):void{
        if( Main._display_prompt == true ){
            // プロンプト表示時は何もしない（Firefox対応）
            return;
        }

        // キャンバス左上基準の座標を取得する
        var offset = Main.getOffset(e);

        if( Main._canvas.is_cable_dragging() == false && Main._canvas.drag_module == null ){
            return;
        }

        if(Main._canvas.is_cable_dragging() ){
            //--------------------------
            // ケーブルドラッグ中の場合
            //--------------------------
            var p = Main._canvas.get_cable_point()!;
            Main._moved = Main._moved || (Main.squareDistance(p.x, p.y, offset.x, offset.y) >= 10*10);
        }
        else if(Main._canvas.drag_module != null){
            //----------------------------
            // モジュールドラッグ中の場合
            //----------------------------
            var all:boolean = (Main._canvas._original_module_arr.indexOf(Main._canvas.drag_module) >= 0);
            var inside:boolean = Main._canvas.is_module_inside_view(all);
            if( inside == false ){
                //--------------------------------
                // モジュールがキャンバス外に出た
                //--------------------------------

                Main.confirm_removing_module();

                // モジュールドラッグ解除
                Main._canvas.drag_module = null;
            }
            else{
                //--------------------------
                // モジュールがキャンバス内
                //--------------------------

                // 座標値更新
                Main._canvas.end_module_drag(offset);
            }
        }

        // 再描画
        Main._canvas.redraw();

        if( Main._canvas.is_cable_dragging() ){
            // 編集中ケーブルを描画
            var p = Main._canvas.get_cable_point();
            Main._canvas.drawLine(p.x, p.y, offset.x, offset.y);
        }
    }

    /**
     *
     * @param e
     */
    private static mouseup(e:any):void{
        var offset = Main.getOffset(e);
        Main.Modified();
        if( Main._canvas.is_cable_dragging() ){
            //----------------------
            // ケーブル編集中の場合
            //----------------------

            if( Main._canvas.end != null ){
                //----------------------------------------------------
                // ケーブル始点（モジュールアウトプット）が未定の場合
                //----------------------------------------------------

                if( Main._moved == false ){
                    //-------------------------
                    // mousedown時の位置と同じ
                    //-------------------------

                    //---------
                    // Quick
                    //---------
                    Main.quick_edit_input(Main._canvas.end);
                }
                else{
                    if( Main._canvas.end.quick_const != '' ){
                        // QuickBus接続がある場合はなにもしない
                    }
                    else if ( Main._canvas.end.prev_output != null ) {
                       // 接続済みの場合は何もしない
                    }
                    else{
                        var output:Output|null = Main._canvas.getHitModuleOutput( offset );
                        if( output != null ){
                            if( output.module != Main._canvas.end.module ){

                                if( Main._canvas.end.module.isLoop(output.module) ){
                                    alert('A recursive loop was detected.');
                                }
                                else{
                                    // 接続
                                    output.connect(Main._canvas.end);
                                    //
                                    Main._canvas.calc_module_order();
                                }
                            }
                        }
                    }
                }
            }
            else{
                //--------------------------------------------------
                // ケーブル終点（モジュールインプット）が未定の場合
                //--------------------------------------------------

                if( Main._moved == false ){
                    //-------------------------
                    // mousedown時の位置と同じ
                    //-------------------------

                    //---------
                    // Quick
                    //---------
                    Main.quick_edit_output(Main._canvas.start!);
                }
                else{
                    var input:Input|null = Main._canvas.getHitModuleInput( offset );
                    if( input != null ){

                        if( input.quick_const != '' ){
                            // なにもしない
                        }
                        else{
                            if( input.module != Main._canvas.start!.module ){

                                if( input.prev_output == null ){

                                    if( input.module.isLoop( Main._canvas.start!.module ) ){
                                        alert('A recursive loop was detected.');
                                    }
                                    else{
                                        // 接続
                                        Main._canvas.start!.connect(input);
                                        //
                                        Main._canvas.calc_module_order();
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 編集中でなくする
            Main._canvas.start = null;
            Main._canvas.end = null;
        }
        else if(Main._canvas.drag_module != null){
            if( Main._canvas._original_module_arr.indexOf(Main._canvas.drag_module) >= 0 ){

                var inside:boolean = Main._canvas.is_module_inside_view(false);
                if( inside == true){

                    var org_m:ModuleBase = Main._canvas.drag_module;
                    var newmodule = Main._module_creator.CreateByName(org_m.name, org_m.x, org_m.y);
                    Main._canvas._module_arr.push(newmodule!);
                }

                // モジュール位置をドラッグ開始位置に戻す
                Main._canvas.cancel_module_drag();
            }

            // 編集中でなくする
            Main._canvas.drag_module = null;
        }

        // 再描画
        Main._canvas.redraw();
    }

    /**
     *
     * @param e
     */
    private static mouseout(e:any):void{
        if( Main._display_prompt == true ){
            return;// プロンプト表示時は何もしない（Firefox対応）
        }

        if( Main._canvas.is_cable_dragging() == false && Main._canvas.drag_module == null){
            return;
        }

        if(Main._canvas.is_cable_dragging()){
            // ケーブルドラッグ解除
            Main._canvas.start = null;
            Main._canvas.end = null;
        }
        else if( Main._canvas.drag_module != null ){

            // モジュール削除確認
            Main.confirm_removing_module();

            // モジュールドラッグ解除
            Main._canvas.drag_module = null;
        }

        // 再描画
        Main._canvas.redraw();
    }

    /**
     *
     */
    private static recent_backward_click():void{
        var aaa = Main._recent_loader.get_recent_backward();
        if ( aaa != null) {
            Main._select_recent.textContent = ''; // remove children
            for( var option of aaa.recent_select ){
                var option_element = document.createElement('option') as HTMLOptionElement;
                option_element.value = option.value;
                option_element.text = option.html;
                Main._select_recent.appendChild(option_element);
            }
            Main._recent_range.textContent = aaa.recent_range;
        }
    }

    /**
     *
     */
    private static recent_forward_click():void{
        var aaa = Main._recent_loader.get_recent_forward();
        if ( aaa != null) {
            Main._select_recent.textContent = ''; // remove children
            for( var option of aaa.recent_select ){
                var option_element = document.createElement('option') as HTMLOptionElement;
                option_element.value = option.value;
                option_element.text = option.html;
                Main._select_recent.appendChild(option_element);
            }
            Main._recent_range.textContent = aaa.recent_range;
        }
    }

    /**
     *
     */
    private static recent_load_click():void{
        // URL移動
        var selected_index:number = Main._select_recent.selectedIndex;
        var selected_option = Main._select_recent.options[selected_index] as HTMLOptionElement;
        location.href = location.pathname + '?' + selected_option.value;
    }

    /**
     * 再生中に異常が発生したときの処理.
     */
    private static audio_error():void {

        alert('An abnormal input signal was detected.');

        // change button caption
        Main._wave_play.value = 'Play';

        // enable file selector
        Main._wave_file.removeAttribute('disabled');
    }

    /**
     *
     */
    private static wave_play_click():void{
        if (Main._wave_play.value == 'Stop') {
            //------
            // stop
            //------

            Main._audio_processor.stop();

            // change button caption
            Main._wave_play.value = 'Play';

            Main._wave_save.removeAttribute('disabled');

            // enable file selector
            Main._wave_file.removeAttribute('disabled');
        }
        else{
            //------
            // play
            //------

            // change button caption
            Main._wave_play.value = 'Stop';

            Main._wave_save.setAttribute( 'disabled', 'disabled' );

            // disable file selector
            Main._wave_file.setAttribute( 'disabled', 'disabled' );


            for ( var m of Main._canvas._module_arr ) {

                if ( m.name == 'samplerate_module' )
                {
                    // 再生時サンプリングレートに再取得

                    m.output_arr[0].value1 = Main._audio_context.sampleRate;
                    m.output_arr[0].value2 = Main._audio_context.sampleRate;
                    m.constant_update(true);
                }

                if ( m.name == 'delay_module' ) {
                    m.input_arr[0].value1 = 0.0; // TODO:
                    m.input_arr[0].value2 = 0.0; // TODO:
                }
            }

            Main._audio_processor.start(Main._decodedBuffer);
        }
    }

    /**
     *
     */
    private static wave_save_click():void {

        //Browser.window.alert("_decodedBuffer.length="+_decodedBuffer.length);
        for ( var m of Main._canvas._module_arr ) {
            if ( m.name == 'samplerate_module' )
            {
                // 再生時サンプリングレートに再取得
                m.output_arr[0].value1 = Main._audio_context.sampleRate;
                m.output_arr[0].value2 = Main._audio_context.sampleRate;
                m.constant_update(true);
            }
            if ( m.name == 'delay_module' ) {
                m.input_arr[0].value1 = 0.0; // TODO:
                m.input_arr[0].value2 = 0.0; // TODO:
            }
        }

        var rander:AudioWriter = new AudioWriter(Main._canvas, Main._decodedBuffer);
        var wavebuf:ArrayBuffer|null = rander.start();
        if ( wavebuf != null ) {
            var blob:Blob = new Blob([ wavebuf ], { "type" : 'audio/wav' } );
            open(URL.createObjectURL(blob), "");
        }
        else {
            alert("???");
        }
    }

    /**
     * wav/oggデコード後の処理.
     * @param buffer
     * @return
     */
    private static decodeFinished(buffer:any):boolean{
        // set decoded buffer
        Main._decodedBuffer = buffer;

        // enable play button and file selector
        Main._wave_play.removeAttribute('disabled');
        Main._wave_save.removeAttribute('disabled');
        Main._wave_file.removeAttribute('disabled');

        return true;
    };

    /**
     *
     * @param e
     */
    private static wave_file_change(e:any):void{
        // 再生ボタンを非活動にする
        Main._wave_play.setAttribute('disabled', 'disabled');
        Main._wave_save.setAttribute('disabled', 'disabled');

        var file_selector = e.target as HTMLInputElement;

        if(file_selector.files?.length == 0){
            //----------------
            // 未選択時は終了
            //----------------
            return;
        }

        // File取得
        var audiofile:File = file_selector.files![0];

        if (audiofile.type != 'audio/wav'
         && audiofile.type != 'audio/ogg'
         && audiofile.type != 'video/ogg'){
            //-----------------------
            // wav/off以外は除外する
            //-----------------------
            file_selector.value = '';
            alert('Please select wav/ogg file.');
            return;
        }

        // ロード中はファイル選択ボタンを非活動にする
        Main._wave_file.setAttribute('disabled', 'disabled');

        // ロード開始
        Main._audio_file_loader.load(audiofile);
    }

    /**
     *
     */
    public static windowLoaded():void {
        // Element取得
        Main._button_clear = document.getElementById('button_clear')!;
        Main._button_commit = document.getElementById('button_commit')!;
        Main._text_midi_msg = document.getElementById('text_midi_msg')!;
        Main._button_ctrl1 = document.getElementById('button_ctrl1')!;
        Main._button_ctrl2 = document.getElementById('button_ctrl2')!;
        Main._button_ctrl3 = document.getElementById('button_ctrl3')!;
        Main._button_learn1 = document.getElementById('button_learn1')!;
        Main._button_learn2 = document.getElementById('button_learn2')!;
        Main._button_learn3 = document.getElementById('button_learn3')!;
        Main._button_revert = document.getElementById('button_revert')!;
        Main._recent_backward = document.getElementById('recent_backward')!;
        Main._recent_forward = document.getElementById('recent_forward')!;
        Main._recent_load = document.getElementById('recent_load')!;
        Main._recent_range = document.getElementById('recent_range')!;
        Main._select_recent = document.getElementById('select_recent') as HTMLSelectElement;
        Main._slider_ctrl1 = document.getElementById('slider_ctrl1') as HTMLInputElement;
        Main._slider_ctrl2 = document.getElementById('slider_ctrl2') as HTMLInputElement;
        Main._slider_ctrl3 = document.getElementById('slider_ctrl3') as HTMLInputElement;
        Main._slider_volume = document.getElementById('slider_volume') as HTMLInputElement;
        Main._text_ctrl1 = document.getElementById('text_ctrl1')!;
        Main._text_ctrl2 = document.getElementById('text_ctrl2')!;
        Main._text_ctrl3 = document.getElementById('text_ctrl3')!;
        Main._text_volume = document.getElementById('text_volume')!;
        Main._wave_file = document.getElementById('wave_file')!;
        Main._wave_play = document.getElementById('wave_play') as HTMLInputElement;
        Main._wave_save = document.getElementById('wave_save')!;
        Main._work_view = document.getElementById('work_view') as HTMLCanvasElement;

        Main._wave_play.setAttribute('disabled', 'disabled');
        Main._wave_save.setAttribute('disabled', 'disabled');
        
        //------
        // MIDI
        //------
        if (navigator.requestMIDIAccess){
            navigator.requestMIDIAccess().then( Main.onMIDIInit );
        }
        else {
            alert("navigator.requestMIDIAccess == null");
        }

        // view
        Main._work_view.setAttribute( 'width', (800).toString() );
        Main._work_view.setAttribute( 'height', (400).toString() );
        Main._canvas = new ConnectionEditor(Main._work_view);

        Main._recent_loader = new RecentLoader();

        // <<ボタンクリック時の処理
        Main._recent_backward.addEventListener("click", Main.recent_backward_click);

        // >>ボタンクリック時の処理
        Main._recent_forward.addEventListener("click", Main.recent_forward_click);

        // Loadボタンクリック時の処理
        Main._recent_load.addEventListener("click", Main.recent_load_click);

        // Playボタンクリック時の処理
        Main._wave_play.addEventListener("click", Main.wave_play_click);

        // Playボタンクリック時の処理
        Main._wave_save.addEventListener("click", Main.wave_save_click);

        // wav/oggファイル選択時の処理
        Main._wave_file.addEventListener("change", Main.wave_file_change);

        //--------------------
        // Volume更新時の処理
        //--------------------
        Main._slider_volume.addEventListener('input', (e)=>{
            //-------------------------------------------
            // changeはだと更新随時更新されない(Firefox)
            //-------------------------------------------

            var srt_value:string = Main._slider_volume.value;

            Main._text_volume.textContent = srt_value;
            Main._audio_processor.update_gain( parseFloat(srt_value) );
        });

        // AudioContext取得
        Main._audio_context = new AudioContext();

        if( Main._audio_context == null ){
            // IEの場合は諦める
            Main._recent_backward.setAttribute('disabled', 'disabled');
            Main._recent_forward.setAttribute('disabled', 'disabled');
            Main._recent_load.setAttribute('disabled', 'disabled');
            Main._button_ctrl1.setAttribute('disabled', 'disabled');
            Main._button_ctrl2.setAttribute('disabled', 'disabled');
            Main._button_ctrl3.setAttribute('disabled', 'disabled');
            Main._button_commit.setAttribute('disabled', 'disabled');
            Main._button_revert.setAttribute('disabled', 'disabled');
            Main._button_clear.setAttribute('disabled', 'disabled');
            return;
        }

        Main._audio_file_loader = new AudioFileReader(Main.decodeFinished, ()=>{}/*TODO*/);
        Main._audio_processor = new AudioProcessor(Main._canvas, Main.audio_error);

        // テキストボックスに反映
        Main._slider_volume.dispatchEvent(new Event('input'));

        // CanvasのMousedown処理
        Main._work_view.addEventListener('mousedown', Main.mousedown);

        // CanvasのMousemove処理
        Main._work_view.addEventListener('mousemove', Main.mousemove);

        // CanvasのMouseup処理
        Main._work_view.addEventListener('mouseup', Main.mouseup);

        // CanvasのMouseout処理
        Main._work_view.addEventListener('mouseout', Main.mouseout);

        //------------------------------------
        // Control1設定ボタンクリック時の処理
        //------------------------------------
        Main._button_ctrl1.addEventListener('click', ()=>{
            var success:boolean = Main.editSlider( Main._slider_ctrl1 );
            if( success == true ){
                // 編集が成功したらモジュール編集済みとする
                Main.Modified();
            }
        });

        //------------------------------------
        // Control2設定ボタンクリック時の処理
        //------------------------------------
        Main._button_ctrl2.addEventListener('click', ()=>{
            var success:boolean = Main.editSlider( Main._slider_ctrl2 );
            if( success == true ){
                // 編集が成功したらモジュール編集済みとする
                Main.Modified();
            }
        });

        //------------------------------------
        // Control3設定ボタンクリック時の処理
        //------------------------------------
        Main._button_ctrl3.addEventListener('click', ()=>{
            var success:boolean = Main.editSlider( Main._slider_ctrl3 );
            if( success == true ){
                // 編集が成功したらモジュール編集済みとする
                Main.Modified();
            }
        });
        
        Main._button_learn1.addEventListener('click',()=>{
            if ( Main._current_midi_msg >= 0)
            {
                Main._midi_learn1 = Main._current_midi_msg;
            }
        });
        
        Main._button_learn2.addEventListener('click', ()=>{
            if ( Main._current_midi_msg >= 0)
            {
                Main._midi_learn2 = Main._current_midi_msg;
            }
        });
        
        Main._button_learn3.addEventListener('click', ()=>{
            if ( Main._current_midi_msg >= 0)
            {
                Main._midi_learn3 = Main._current_midi_msg;
            }
        });

        //-----------------------------
        // Ctrl1スライダー更新時の処理
        //-----------------------------
        Main._slider_ctrl1.addEventListener('input', ()=>{
            //-------------------------------------------
            // changeはだと更新随時更新されない(Firefox)
            //-------------------------------------------

            var str_value:string = Main._slider_ctrl1.value;

            // テキスト更新
            Main._text_ctrl1.textContent = str_value;
            Main._canvas._ctrl_module_arr[0].value = parseFloat(str_value);
            Main._canvas._ctrl_module_arr[0].constant_update(true);

            Main.Modified();
        });

        //-----------------------------
        // Ctrl2スライダー更新時の処理
        //-----------------------------
        Main._slider_ctrl2.addEventListener('input', ()=>{
            //-------------------------------------------
            // changeはだと更新随時更新されない(Firefox)
            //-------------------------------------------

            var str_value:string = Main._slider_ctrl2.value;

            // テキスト更新
            Main._text_ctrl2.textContent = str_value;
            Main._canvas._ctrl_module_arr[1].value = parseFloat(str_value);
            Main._canvas._ctrl_module_arr[1].constant_update(true);

            Main.Modified();
        });

        //-----------------------------
        // Ctrl3スライダー更新時の処理
        //-----------------------------
        Main._slider_ctrl3.addEventListener('input', ()=>{
            //-------------------------------------------
            // changeはだと更新随時更新されない(Firefox)
            //-------------------------------------------

            var str_value:string = Main._slider_ctrl3.value;

            // テキスト更新
            Main._text_ctrl3.textContent =str_value;
            Main._canvas._ctrl_module_arr[2].value = parseFloat(str_value);
            Main._canvas._ctrl_module_arr[2].constant_update(true);

            Main.Modified();
        });

        //------------------------------
        // Commitボタンクリック時の処理
        //------------------------------
        Main._button_commit.addEventListener('click', ()=>{

            // 配置情報のJSON文字列を作成
            var json_string = JSON.stringify(JsonConverter.getSaveObject(Main._canvas._module_arr, [ Main._slider_ctrl1, Main._slider_ctrl2, Main._slider_ctrl3 ]));

            // 送信
            var request:XMLHttpRequest = new XMLHttpRequest();
            request.open('POST', 'commit.cgi', false/*同期*/);
            request.send(json_string);
            if( request.status == 200 ){
                //------
                // 成功
                //------

                // ページを移動する（移動後のページで送信した保存内容を復元）
                location.href = location.pathname + '?' + request.response;
            }
            else{
                //----------------
                // 予期せぬエラー
                //----------------
                alert('commit error');
            }
        });

        //------------------------------
        // Revertボタンクリック時の処理
        //------------------------------
        Main._button_revert.addEventListener('click', ()=>{
            // 再ロード
            location.reload(true);
        });

        //-----------------------------
        // Clearボタンクリック時の処理
        //-----------------------------
        Main._button_clear.addEventListener('click', ()=>{
            // ?以降を取り除いたページに移動
            location.href = location.pathname;
        });

        var name_list:string[] =
        [
            'input_module',
            'output_module',
            'add_module',
            'subtract_module',
            'multiply_module',
            'divide_module',
            'sqrt_module',
            'sin_module',
            'cos_module',
            'tan_module',
            'samplerate_module',
            'min_module',
            'max_module',
            'delay_module',
            'control_module_1',
            'control_module_2',
            'control_module_3'
        ];
        ImageLoader.load(name_list, Main.Image_Loaded);
    }

    /**
     * 画像ロード完了後の処理
     * @param img_arr
     * @param Image>
     */
    private static Image_Loaded(img_map:Map < string, HTMLImageElement > ):void {
        Main._module_creator = new ModuleCreator(img_map);

        //------------------------------
        // オリジナルのモジュールを配置
        //------------------------------

        // 加算モジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('add_module', 100, 10, false)!);

        // 減算モジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('subtract_module', 150, 10, false)!);

        // 乗算モジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('multiply_module', 200, 10, false)!);

        // 除算モジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('divide_module', 250, 10, false)!);

        // minモジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('min_module', 300, 10, false)!);

        // minモジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('max_module', 350, 10, false)!);

        // 遅延モジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('delay_module', 400, 20, false)!);

        // sqrtモジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('sqrt_module', 450, 20, false)!);

        // sinモジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('sin_module', 500, 20, false)!);

        // cosモジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('cos_module', 550, 20, false)!);

        // tanモジュール
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('tan_module', 600, 20, false)!);

        //
        if( location.search.length > 0 ){

            // 送信
            var request:XMLHttpRequest = new XMLHttpRequest();
            request.open('POST', 'load.cgi', false/*同期*/);
            request.send( location.search.substring(1)/*?を取り除く*/);

            if( request.status != 200 ){
                alert('load error');
                return;
            }

            if( request.response.length <= 0 ){
                location.href = location.pathname;
                return;
            }

            try{
                // parse
                var loaded_data:any = JSON.parse(request.response);

                //----------------
                // モジュール配置
                //----------------
                Main._canvas._module_arr = JsonConverter.aaa(Main._module_creator, loaded_data);

                Main._canvas._ctrl_module_arr = [];
                for ( var m of Main._canvas._module_arr ){
                    if ( m.name == 'control_module' ) {
                        Main._canvas._ctrl_module_arr.push(m as ControlModule);
                    }
                    else if ( m.name == 'input_module' ) {
                        Main._canvas._input_module = m as InputModule;
                    }
                    else if ( m.name == 'output_module' ) {
                        Main._canvas._output_module = m as OutputModule;
                    }
                }

                // control更新
                var control_info:any[] = loaded_data.control_info;
                for ( var ctrl_idx = 0; ctrl_idx < control_info.length; ctrl_idx++ ) {
                    var ctrl = control_info[ctrl_idx];

                    var slider:HTMLInputElement;
                    if( ctrl_idx == 0 ){
                        slider = Main._slider_ctrl1;
                    }
                    else if( ctrl_idx == 1 ){
                        slider = Main._slider_ctrl2;
                    }
                    else if( ctrl_idx == 2 ){
                        slider = Main._slider_ctrl3;
                    }
                    else{
                        return;
                    }

                    slider.setAttribute( 'min', ctrl.min );
                    slider.setAttribute( 'max', ctrl.max );
                    slider.setAttribute( 'step', ctrl.step);
                    slider.value = ctrl.value;

                    // 更新
                    slider.dispatchEvent(new Event('input'));
                }


                Main._button_clear.removeAttribute('disabled');
            }
            catch(e){
                alert('データが不正です。');
                location.href = location.pathname;
            }
        }
        else{
            // Inputモジュール
            var input_module = Main._module_creator.CreateByName('input_module', 4, 100, false) as InputModule;
            Main._canvas._module_arr.push(input_module);
            Main._canvas._input_module = input_module;

            // Outputモジュール
            var output_module = Main._module_creator.CreateByName('output_module', 800 - 50, 100, false) as OutputModule;
            Main._canvas._module_arr.push(output_module);
            Main._canvas._output_module = output_module;

            // Controlモジュール1
            var ctrl1_module = Main._module_creator.CreateByName('control_module', 4, 150, false) as ControlModule;
            Main._canvas._module_arr.push(ctrl1_module);
            Main._canvas._ctrl_module_arr.push(ctrl1_module);

            // Controlモジュール2
            var ctrl2_module = Main._module_creator.CreateByName('control_module', 4, 200, false) as ControlModule;
            Main._canvas._module_arr.push(ctrl2_module);
            Main._canvas._ctrl_module_arr.push(ctrl2_module);

            // Controlモジュール3
            var ctrl3_module = Main._module_creator.CreateByName('control_module', 4, 250, false) as ControlModule;
            Main._canvas._module_arr.push(ctrl3_module);
            Main._canvas._ctrl_module_arr.push(ctrl3_module);

            // SanpleRateモジュール
            var samplerate_module = Main._module_creator.CreateByName('samplerate_module', 4, 300, false) as SampleRateModule;
            Main._canvas._module_arr.push(samplerate_module);
            Main._canvas._samplerate_module = samplerate_module;


            Main._slider_ctrl1.dispatchEvent(new Event('input'));
            Main._slider_ctrl2.dispatchEvent(new Event('input'));
            Main._slider_ctrl3.dispatchEvent(new Event('input'));
        }

        Main._button_commit.setAttribute('disabled', 'disabled');

        Main._button_revert.setAttribute('disabled', 'disabled');

        // ファイル選択ボタンを活動にする
        Main._wave_file.removeAttribute('disabled');

        Main._canvas.redraw();

        Main._edit = false;

        Main._canvas.calc_module_order();

        // 最近のコミット情報を取得する
        Main._recent_backward.click();
    }
    
    /**
     * MIDI初期化
     * @param m
     */
    private static onMIDIInit(m:WebMidi.MIDIAccess):void {
        var it = m.inputs.values();
        var o = it.next();
        while ( o.done == false )
        {
            document.getElementById('text_midi_in_device')!.textContent = o.value.name!;
            o.value.onmidimessage = Main.onmidimessage;
            o = it.next();
        }
    }
    
    /**
     * MIDIメッセージ受信時の処理
     * @param e
     */
    private static onmidimessage(e:WebMidi.MIDIMessageEvent) {
        Main._text_midi_msg.textContent =
            '0x' + e.data[0].toString(16)
            + ' 0x' + e.data[1].toString(16)
            + ' 0x' + e.data[2].toString(16);
            
        Main._current_midi_msg = e.data[1];
        
        var t : number = e.data[2] / 127.0;
        if ( Main._midi_learn1 == Main._current_midi_msg)
        {
            //更新
            var min1:number = parseFloat(Main._slider_ctrl1.getAttribute('min')!);
            var max1:number = parseFloat(Main._slider_ctrl1.getAttribute('max')!);
            Main._slider_ctrl1.value =  ( min1 * (1 - t) + max1 * t ).toString();
            Main._slider_ctrl1.dispatchEvent(new Event('input'));
        }
        if ( Main._midi_learn2 == Main._current_midi_msg)
        {
            //更新
            var min2:number = parseFloat(Main._slider_ctrl2.getAttribute('min')!);
            var max2:number = parseFloat(Main._slider_ctrl2.getAttribute('max')!);
            Main._slider_ctrl2.value = ( min2 * (1 - t) + max2 * t ).toString();
            Main._slider_ctrl2.dispatchEvent(new Event('input'));
        }
        if ( Main._midi_learn3 == Main._current_midi_msg)
        {
            //更新
            var min3:number = parseFloat(Main._slider_ctrl3.getAttribute('min')!);
            var max3:number = parseFloat(Main._slider_ctrl3.getAttribute('max')!);
            Main._slider_ctrl3.value = ( min3 * (1 - t) + max3 * t ).toString();
            Main._slider_ctrl3.dispatchEvent(new Event('input'));
        }
    }
}

window.onload = Main.windowLoaded;