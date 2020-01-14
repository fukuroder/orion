import vue.Vue;
import js.html.Event;
import js.html.Element;
import js.Browser;
import js.html.audio.AudioBuffer;
import js.html.audio.AudioContext;
import js.lib.ArrayBuffer;
import js.html.Blob;
import js.html.CanvasElement;
import js.html.File;
import js.html.Image;
import js.html.InputElement;
import js.html.URL;
import js.html.XMLHttpRequest;
import AudioFileReader;
import AudioProcessor;
import AudioWriter;
import ConnectionEditor;
import ImageLoader;
import io.Input;
import io.Output;
import JsonConverter;
import module.ModuleBase;
import ModuleCreator;
import RecentLoader;

/**
 * メイン.
 * @author fukuroda
 */
class Main {
    /**
     * TODO:
     */
    static var _audio_context:AudioContext;

    /**
     * TODO:
     */
    static var _display_prompt:Bool = false;

    /**
     * TODO:
     */
    static var _moved:Bool = false;

    /**
     * TODO:
     */
    static var _edit:Bool = false;

    /**
     * TODO:
     */
    static var _decodedBuffer:AudioBuffer;

    /**
     * TODO:
     */
    static var _button_clear:Element;

    /**
     * TODO:
     */
    static var _button_commit:Element;
    
    /**
     * TODO:
     */
    static var _text_midi_msg:Element;

    /**
     * TODO:
     */
    static var _button_ctrl1:Element;

    /**
     * TODO:
     */
    static var _button_ctrl2:Element;

    /**
     * TODO:
     */
    static var _button_ctrl3:Element;
    
    /**
     * TODO:
     */
    static var _button_learn1:Element;

    /**
     * TODO:
     */
    static var _button_learn2:Element;

    /**
     * TODO:
     */
    static var _button_learn3:Element;

    /**
     * TODO:
     */
    static var _current_midi_msg:Int;

    /**
     * TODO:
     */
    static var _midi_learn1:Int = -1;

    /**
     * TODO:
     */
    static var _midi_learn2:Int = -1;

    /**
     * TODO:
     */
    static var _midi_learn3:Int = -1;
    
    /**
     * TODO:
     */
    static var _button_revert:Element;

    /**
     * TODO:
     */
    static var _slider_ctrl1:InputElement;

    /**
     * TODO:
     */
    static var _slider_ctrl2:InputElement;

    /**
     * TODO:
     */
    static var _slider_ctrl3:InputElement;

    /**
     * TODO:
     */
    static var _slider_volume:InputElement;

    /**
     * TODO:
     */
    static var _text_ctrl1:Element;

    /**
     * TODO:
     */
    static var _text_ctrl2:Element;

    /**
     * TODO:
     */
    static var _text_ctrl3:Element;

    /**
     * TODO:
     */
    static var _text_volume:Element;

    /**
     * TODO:
     */
    static var _wave_file:Element;

    /**
     * TODO:
     */
    static var _wave_play:InputElement;

    /**
     * TODO:
     */
    static var _wave_save:Element;

    /**
     * TODO:
     */
    static var _work_view:CanvasElement;

    /**
     * TODO:
     */
    static var _canvas:ConnectionEditor;

    /**
     * TODO:
     */
    static var _audio_processor:AudioProcessor;

    /**
     * TODO:
     */
    static var _recent_loader:RecentLoader;

    /**
     * TODO:
     */
    static var _audio_file_loader:AudioFileReader;

    /**
     * TODO:
     */
    static var _module_creator:ModuleCreator;

    /**
     * メイン.
     */
    static function main():Void {
        var recent_loader:RecentLoader = new RecentLoader();

        new Vue({
			el: '#recent',
			data: {
                selected: '',
                options: [],
                recent_range: ''
            },
            methods: {
                recent_backward_click:()->{
                    var recent_save_data = recent_loader.get_recent_backward();
                    if ( recent_save_data != null) {
                        // select first option
                        js.Lib.nativeThis.selected = recent_save_data.recent_select[0].value;
                        js.Lib.nativeThis.options = recent_save_data.recent_select;
                        js.Lib.nativeThis.recent_range = recent_save_data.recent_range;
                    }
                },
                recent_forward_click:()->{
                    var recent_save_data = recent_loader.get_recent_forward();
                    if ( recent_save_data != null) {
                        // select first option
                        js.Lib.nativeThis.selected = recent_save_data.recent_select[0].value;
                        js.Lib.nativeThis.options = recent_save_data.recent_select;
                        js.Lib.nativeThis.recent_range = recent_save_data.recent_range;
                    }
                },
                recent_load_click:()->{
                    var selected_option_value:String = js.Lib.nativeThis.selected;
                    // URL移動
                    Browser.window.location.href = Browser.window.location.pathname + '?' + selected_option_value;
                }   
            },
            created:()->{
                var recent_save_data = recent_loader.get_recent_backward();
                if ( recent_save_data != null) {
                    // select first option
                    js.Lib.nativeThis.selected = recent_save_data.recent_select[0].value;
                    js.Lib.nativeThis.options = recent_save_data.recent_select;
                    js.Lib.nativeThis.recent_range = recent_save_data.recent_range;
                }
            }
        });
        
        Browser.window.onload = windowLoaded;
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
     * キャンバス左上基準の座標を取得する.
     * @param e TODO:
     * @return
     */
    static function getOffset(e){
        //----------------------------------
        // FirefoxはOffsetX,OffsetYが未定義
        //----------------------------------
        return {x:e.pageX-e.target.offsetLeft, y:e.pageY-e.target.offsetTop};
    }

    /**
     * スライダーのmin,max,stepを変更する.
     * @param slider
     */
    static function editSlider(slider:InputElement):Bool{
        do{
            // プロンプト表示
            var str = Browser.window.prompt('Input min, max, step.', slider.getAttribute('min') + ', ' + slider.getAttribute('max') + ', ' + slider.getAttribute('step'));
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
                var min:Float = untyped __js__('Number(min_str)');
                var max:Float = untyped __js__('Number(max_str)');
                var step:Float = untyped __js__('Number(step_str)');

                // parseに成功しているかチェック
                if( Math.isNaN(min) || Math.isNaN(max) || Math.isNaN(step) ){
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
                var value:Float = Std.parseFloat( slider.value );
                if( value < min ){
                    value = min;
                }
                else if( max < value ){
                    value = max;
                }

                // min,max,step更新
                slider.setAttribute('min', Std.string(min));
                slider.setAttribute('max', Std.string(max));
                slider.setAttribute('step', Std.string(step));

                // value更新
                slider.value = Std.string(value);
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
    static function Modified():Void{
        if( _edit == false ){
            _button_commit.removeAttribute('disabled');
            _button_revert.removeAttribute('disabled');
            _button_clear.removeAttribute('disabled');
            _edit = true;
        }
    }

    /**
     * モジュール削除確認.
     */
    static function confirm_removing_module():Void{
        //--------------------------------
        // モジュールがキャンバス外に出た
        //--------------------------------
        var delete_ok:Bool = false;
        if( _canvas.drag_module.removable == true ){

            // プロンプト表示
            _display_prompt = true; // ガード
            delete_ok = Browser.window.confirm('May the module be deleted?');
            _display_prompt = false; // ガード
        }

        if( delete_ok == true ){
            // モジュールを削除する
            _canvas._module_arr.pop().removeModule();// ドラッグ中のモジュールは最後に入ってる

            _canvas.calc_module_order();
        }
        else{
            // モジュール位置をドラッグ開始位置に戻す
            _canvas.cancel_module_drag();
        }
    }

    /**
     *
     * @param input
     */
    static function quick_edit_input(input:Input):Void{
        var org_busName:String = '';
        if( input.quick_const != '' ){
            org_busName = input.quick_const;
        }
        else if( input.prev_output != null ){
            org_busName = input.prev_output.quick_bus_name;
        }

        // QuickBus/QuickConst入力のプロンプト表示
        _display_prompt = true; // ガード
        var q_bus_or_const_name:String = Browser.window.prompt('Input QuickBus or QuickConst.',  org_busName);
        _display_prompt = false; // ガード

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

                var q_const:Float = untyped __js__('Number(q_bus_or_const_name)');
                if( Math.isNaN(q_const) == false ){
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
                    var new_output:Output = _canvas.getResisterdQuickBus(q_bus_or_const_name);
                    if( new_output != null ){
                        //----------------
                        // 登録済みの場合
                        //----------------

                        // 接続を解除する
                        if( input.prev_output != null ){
                            input.prev_output.disconnect_quickbus(input);
                        }

                        if( input.module.isLoop(new_output.module) ){
                            Browser.window.alert('A recursive loop was detected.');
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

                        Browser.window.alert('The input name is not registered as QuickBus.');
                    }
                }
            }

            //
            _canvas.calc_module_order();
        }
    }

    /**
     *
     * @param output
     */
    static function quick_edit_output(output:Output):Void{
         //----------------------------------------------------------------------
        // mousedown時の位置と同じ場合はQuickBus入力のプロンプト表示
        //----------------------------------------------------------------------
        _display_prompt = true;
        var q_bus_name:String = Browser.window.prompt('Input QuickBus.', output.quick_bus_name);
        _display_prompt = false;

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

                var q_const:Float = untyped __js__('Number(q_bus_name)');
                if( Math.isNaN(q_const) ){

                    //-------------
                    // 数字でない場合
                    //-------------

                    // 使用済みの名前かチェック
                    var used_output:Output = _canvas.getResisterdQuickBus(q_bus_name);
                    if( used_output != null ){
                        //----------
                        // 使用済み
                        //----------
                        Browser.window.alert('The input name has been already registered as QuickBus.');
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
                    Browser.window.alert('The input name has an error as QuickBus.');
                }
            }

            _canvas.calc_module_order();
        }
    }

    /**
     *
     * @param e
     */
    static function mousedown(e:Dynamic):Void{
        if( e.button != 0 ){
            //-----------------------------
            // 右ボタン(0)以外は何もしない
            //-----------------------------
            return;
        }

        _moved = false;

        // キャンバス左上基準の座標を取得する
        var offset = getOffset(e);

        // 接続済みコネクタ干渉チェック
        var connected_input:Input = _canvas.getConnectedInput( offset );

        if( connected_input != null ){
            //--------------------------------------
            // ケーブルが既に繋がっていた場合
            // →終点側をクリアして編集中扱いとする
            //--------------------------------------

            // Output取得
            var output:Output = connected_input.prev_output;

            // 切断
            output.disconnect(connected_input);

            _canvas.calc_module_order();

            // ケーブルインスタンス生成
            _canvas.start_cable_drag(output, null /*終点未定*/);

            _moved = true;
        }
        else{
            //--------------------------------------------
            // 未接続コネクタ・モジュール本体干渉チェック
            //-------------------------------------------
            var input:Input = _canvas.getHitModuleInput( offset );
            if( input != null ){
                //--------------------------
                // インプットコネクタと干渉
                //--------------------------
                _canvas.start_cable_drag(null, input);
            }
            else{
                var output:Output = _canvas.getHitModuleOutput( offset );
                if( output != null ){
                    //----------------------------
                    // アウトプットコネクタと干渉
                    //----------------------------
                    _canvas.start_cable_drag(output, null);
                }
                else{
                    var module:ModuleBase = _canvas.getHitModule( offset );
                    if( module != null ){
                        //----------------------
                        // モジュール本体と干渉
                        //----------------------

                        // 最上位に描画されるように移動
                        _canvas._module_arr.remove(module);
                        _canvas._module_arr.push(module);

                        // ドラッグ位置を保持
                        _canvas.start_module_drag(module, offset.x, offset.y);
                    }
                    else{
                        var original_module:ModuleBase = _canvas.getHitModule2222( offset );
                        if( original_module != null ){
                            // ドラッグ位置を保持
                            _canvas.start_module_drag(original_module, offset.x, offset.y);
                        }
                    }
                }
            }

            _moved = false;
        }
    }

    /**
     *
     * @param e
     */
    static function mousemove(e:Dynamic):Void{
        if( _display_prompt == true ){
            // プロンプト表示時は何もしない（Firefox対応）
            return;
        }

        // キャンバス左上基準の座標を取得する
        var offset = getOffset(e);

        if( _canvas.is_cable_dragging() == false && _canvas.drag_module == null ){
            return;
        }

        if(_canvas.is_cable_dragging() ){
            //--------------------------
            // ケーブルドラッグ中の場合
            //--------------------------
            var p = _canvas.get_cable_point();
            _moved = _moved || (squareDistance(p.x, p.y, offset.x, offset.y) >= 10*10);
        }
        else if(_canvas.drag_module != null){
            //----------------------------
            // モジュールドラッグ中の場合
            //----------------------------
            var all:Bool = (_canvas._original_module_arr.indexOf(_canvas.drag_module) >= 0);
            var inside:Bool = _canvas.is_module_inside_view(all);
            if( inside == false ){
                //--------------------------------
                // モジュールがキャンバス外に出た
                //--------------------------------

                confirm_removing_module();

                // モジュールドラッグ解除
                _canvas.drag_module = null;
            }
            else{
                //--------------------------
                // モジュールがキャンバス内
                //--------------------------

                // 座標値更新
                _canvas.end_module_drag(offset);
            }
        }

        // 再描画
        _canvas.redraw();

        if( _canvas.is_cable_dragging() ){
            // 編集中ケーブルを描画
            var p = _canvas.get_cable_point();
            _canvas.drawLine(p.x, p.y, offset.x, offset.y);
        }
    }

    /**
     *
     * @param e
     */
    static function mouseup(e:Dynamic):Void{
        var offset = getOffset(e);
        Modified();
        if( _canvas.is_cable_dragging() ){
            //----------------------
            // ケーブル編集中の場合
            //----------------------

            if( _canvas.end != null ){
                //----------------------------------------------------
                // ケーブル始点（モジュールアウトプット）が未定の場合
                //----------------------------------------------------

                if( _moved == false ){
                    //-------------------------
                    // mousedown時の位置と同じ
                    //-------------------------

                    //---------
                    // Quick
                    //---------
                    quick_edit_input(_canvas.end);
                }
                else{
                    if( _canvas.end.quick_const != '' ){
                        // QuickBus接続がある場合はなにもしない
                    }
                    else if ( _canvas.end.prev_output != null ) {
                       // 接続済みの場合は何もしない
                    }
                    else{
                        var output:Output = _canvas.getHitModuleOutput( offset );
                        if( output != null ){
                            if( output.module != _canvas.end.module ){

                                if( _canvas.end.module.isLoop(output.module) ){
                                    Browser.window.alert('A recursive loop was detected.');
                                }
                                else{
                                    // 接続
                                    output.connect(_canvas.end);
                                    //
                                    _canvas.calc_module_order();
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

                if( _moved == false ){
                    //-------------------------
                    // mousedown時の位置と同じ
                    //-------------------------

                    //---------
                    // Quick
                    //---------
                    quick_edit_output(_canvas.start);
                }
                else{
                    var input:Input = _canvas.getHitModuleInput( offset );
                    if( input != null ){

                        if( input.quick_const != '' ){
                            // なにもしない
                        }
                        else{
                            if( input.module != _canvas.start.module ){

                                if( input.prev_output == null ){

                                    if( input.module.isLoop( _canvas.start.module ) ){
                                        Browser.window.alert('A recursive loop was detected.');
                                    }
                                    else{
                                        // 接続
                                        _canvas.start.connect(input);
                                        //
                                        _canvas.calc_module_order();
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 編集中でなくする
            _canvas.start = null;
            _canvas.end = null;
        }
        else if(_canvas.drag_module != null){
            if( _canvas._original_module_arr.indexOf(_canvas.drag_module) >= 0 ){

                var inside:Bool = _canvas.is_module_inside_view(false);
                if( inside == true){

                    var org_m:ModuleBase = _canvas.drag_module;
                    var newmodule = _module_creator.CreateByName(org_m.name, org_m.x, org_m.y);
                    _canvas._module_arr.push(newmodule);
                }

                // モジュール位置をドラッグ開始位置に戻す
                _canvas.cancel_module_drag();
            }

            // 編集中でなくする
            _canvas.drag_module = null;
        }

        // 再描画
        _canvas.redraw();
    }

    /**
     *
     * @param e
     */
    static function mouseout(e:Dynamic):Void{
        if( _display_prompt == true ){
            return;// プロンプト表示時は何もしない（Firefox対応）
        }

        if( _canvas.is_cable_dragging() == false && _canvas.drag_module == null){
            return;
        }

        if(_canvas.is_cable_dragging()){
            // ケーブルドラッグ解除
            _canvas.start = null;
            _canvas.end = null;
        }
        else if( _canvas.drag_module != null ){

            // モジュール削除確認
            confirm_removing_module();

            // モジュールドラッグ解除
            _canvas.drag_module = null;
        }

        // 再描画
        _canvas.redraw();
    }

    /**
     * 再生中に異常が発生したときの処理.
     */
    static function audio_error():Void {

        Browser.window.alert('An abnormal input signal was detected.');

        // change button caption
        _wave_play.value = 'Play';

        // enable file selector
        _wave_file.removeAttribute('disabled');
    }

    /**
     *
     */
    static function wave_play_click():Void{
        if (_wave_play.value == 'Stop') {
            //------
            // stop
            //------

            _audio_processor.stop();

            // change button caption
            _wave_play.value = 'Play';

            _wave_save.removeAttribute('disabled');

            // enable file selector
            _wave_file.removeAttribute('disabled');
        }
        else{
            //------
            // play
            //------

            // change button caption
            _wave_play.value = 'Stop';

            _wave_save.setAttribute( 'disabled', 'disabled' );

            // disable file selector
            _wave_file.setAttribute( 'disabled', 'disabled' );


            for ( m in _canvas._module_arr ) {

                if ( m.name == 'samplerate_module' )
                {
                    // 再生時サンプリングレートに再取得

                    m.output_arr[0].value1 = _audio_context.sampleRate;
                    m.output_arr[0].value2 = _audio_context.sampleRate;
                    m.constant_update(true);
                }

                if ( m.name == 'delay_module' ) {
                    m.input_arr[0].value1 = 0.0; // TODO:
                    m.input_arr[0].value2 = 0.0; // TODO:
                }
            }

            _audio_processor.start(_decodedBuffer);
        }
    }

    /**
     *
     */
    static function wave_save_click():Void {

        //Browser.window.alert("_decodedBuffer.length="+_decodedBuffer.length);
        for ( m in _canvas._module_arr ) {
            if ( m.name == 'samplerate_module' )
            {
                // 再生時サンプリングレートに再取得
                m.output_arr[0].value1 = _audio_context.sampleRate;
                m.output_arr[0].value2 = _audio_context.sampleRate;
                m.constant_update(true);
            }
            if ( m.name == 'delay_module' ) {
                m.input_arr[0].value1 = 0.0; // TODO:
                m.input_arr[0].value2 = 0.0; // TODO:
            }
        }

        var rander:AudioWriter = new AudioWriter(_canvas, _decodedBuffer);
        var wavebuf:ArrayBuffer = rander.start();
        if ( wavebuf != null ) {
            var blob:Blob = new Blob([ wavebuf ], { "type" : 'audio/wav' } );
            Browser.window.open(URL.createObjectURL(blob), "");
        }
        else {
            Browser.window.alert("???");
        }
    }

    /**
     * wav/oggデコード後の処理.
     * @param buffer
     * @return
     */
    static function decodeFinished(buffer):Bool{
        // set decoded buffer
        _decodedBuffer = buffer;

        // enable play button and file selector
        _wave_play.removeAttribute('disabled');
        _wave_save.removeAttribute('disabled');
        _wave_file.removeAttribute('disabled');

        return true;
    };

    /**
     *
     * @param e
     */
    static function wave_file_change(e):Void{
        // 再生ボタンを非活動にする
        _wave_play.setAttribute('disabled', 'disabled');
        _wave_save.setAttribute('disabled', 'disabled');

        var file_selector:InputElement = cast(e.target, InputElement);

        if(file_selector.files.length == 0){
            //----------------
            // 未選択時は終了
            //----------------
            return;
        }

        // File取得
        var audiofile:File = file_selector.files[0];

        if (audiofile.type != 'audio/wav'
         && audiofile.type != 'audio/ogg'
         && audiofile.type != 'video/ogg'){
            //-----------------------
            // wav/off以外は除外する
            //-----------------------
            file_selector.value = '';
            Browser.window.alert('Please select wav/ogg file.');
            return;
        }

        // ロード中はファイル選択ボタンを非活動にする
        _wave_file.setAttribute('disabled', 'disabled');

        // ロード開始
        _audio_file_loader.load(audiofile);
    }

    /**
     *
     */
    static function windowLoaded():Void {
        // Element取得
        _button_clear = Browser.document.getElementById('button_clear');
        _button_commit = Browser.document.getElementById('button_commit');
        _text_midi_msg = Browser.document.getElementById('text_midi_msg');
        _button_ctrl1 = Browser.document.getElementById('button_ctrl1');
        _button_ctrl2 = Browser.document.getElementById('button_ctrl2');
        _button_ctrl3 = Browser.document.getElementById('button_ctrl3');
        _button_learn1 = Browser.document.getElementById('button_learn1');
        _button_learn2 = Browser.document.getElementById('button_learn2');
        _button_learn3 = Browser.document.getElementById('button_learn3');
        _button_revert = Browser.document.getElementById('button_revert');
        _slider_ctrl1 = cast(Browser.document.getElementById('slider_ctrl1'), InputElement);
        _slider_ctrl2 = cast(Browser.document.getElementById('slider_ctrl2'), InputElement);
        _slider_ctrl3 = cast(Browser.document.getElementById('slider_ctrl3'), InputElement);
        _slider_volume = cast(Browser.document.getElementById('slider_volume'), InputElement);
        _text_ctrl1 = Browser.document.getElementById('text_ctrl1');
        _text_ctrl2 = Browser.document.getElementById('text_ctrl2');
        _text_ctrl3 = Browser.document.getElementById('text_ctrl3');
        _text_volume = Browser.document.getElementById('text_volume');
        _wave_file = Browser.document.getElementById('wave_file');
        _wave_play = cast(Browser.document.getElementById('wave_play'), InputElement);
        _wave_save = Browser.document.getElementById('wave_save');
        _work_view = cast(Browser.document.getElementById('work_view'), CanvasElement);

        _wave_play.setAttribute('disabled', 'disabled');
        _wave_save.setAttribute('disabled', 'disabled');
        
        //------
        // MIDI
        //------
        var navigator:Dynamic = Browser.window.navigator;
        if (navigator.requestMIDIAccess){
            navigator.requestMIDIAccess().then( onMIDIInit );
        }
        else {
            Browser.alert("navigator.requestMIDIAccess == null");
        }

        // view
        _work_view.setAttribute( 'width', Std.string(800) );
        _work_view.setAttribute( 'height', Std.string(400) );
        _canvas = new ConnectionEditor(_work_view);

        // Playボタンクリック時の処理
        _wave_play.addEventListener("click", wave_play_click);

        // Playボタンクリック時の処理
        _wave_save.addEventListener("click", wave_save_click);

        // wav/oggファイル選択時の処理
        _wave_file.addEventListener("change", wave_file_change);

        //--------------------
        // Volume更新時の処理
        //--------------------
        _slider_volume.addEventListener('input', function(e){
            //-------------------------------------------
            // changeはだと更新随時更新されない(Firefox)
            //-------------------------------------------

            var srt_value:String = _slider_volume.value;

            _text_volume.textContent = srt_value;
            _audio_processor.update_gain( Std.parseFloat(srt_value) );
        });

        // AudioContext取得
        _audio_context = new AudioContext();

        if( _audio_context == null ){
            // IEの場合は諦める
            //_recent_backward.setAttribute('disabled', 'disabled');
            //_recent_forward.setAttribute('disabled', 'disabled');
            //_recent_load.setAttribute('disabled', 'disabled');
            _button_ctrl1.setAttribute('disabled', 'disabled');
            _button_ctrl2.setAttribute('disabled', 'disabled');
            _button_ctrl3.setAttribute('disabled', 'disabled');
            _button_commit.setAttribute('disabled', 'disabled');
            _button_revert.setAttribute('disabled', 'disabled');
            _button_clear.setAttribute('disabled', 'disabled');
            return;
        }

        _audio_file_loader = new AudioFileReader(decodeFinished, ()->{}/*TODO*/);
        _audio_processor = new AudioProcessor(_canvas, audio_error);

        // テキストボックスに反映
        _slider_volume.dispatchEvent(new Event('input'));

        // CanvasのMousedown処理
        _work_view.addEventListener('mousedown', mousedown);

        // CanvasのMousemove処理
        _work_view.addEventListener('mousemove', mousemove);

        // CanvasのMouseup処理
        _work_view.addEventListener('mouseup', mouseup);

        // CanvasのMouseout処理
        _work_view.addEventListener('mouseout', mouseout);

        //------------------------------------
        // Control1設定ボタンクリック時の処理
        //------------------------------------
        _button_ctrl1.addEventListener('click', ()->{
            var success:Bool = editSlider( _slider_ctrl1 );
            if( success == true ){
                // 編集が成功したらモジュール編集済みとする
                Modified();
            }
        });

        //------------------------------------
        // Control2設定ボタンクリック時の処理
        //------------------------------------
        _button_ctrl2.addEventListener('click', ()->{
            var success:Bool = editSlider( _slider_ctrl2 );
            if( success == true ){
                // 編集が成功したらモジュール編集済みとする
                Modified();
            }
        });

        //------------------------------------
        // Control3設定ボタンクリック時の処理
        //------------------------------------
        _button_ctrl3.addEventListener('click', ()->{
            var success:Bool = editSlider( _slider_ctrl3 );
            if( success == true ){
                // 編集が成功したらモジュール編集済みとする
                Modified();
            }
        });
        
        _button_learn1.addEventListener('click',()->{
            if ( _current_midi_msg >= 0)
            {
                _midi_learn1 = _current_midi_msg;
            }
        });
        
        _button_learn2.addEventListener('click', ()->{
            if ( _current_midi_msg >= 0)
            {
                _midi_learn2 = _current_midi_msg;
            }
        });
        
        _button_learn3.addEventListener('click', ()->{
            if ( _current_midi_msg >= 0)
            {
                _midi_learn3 = _current_midi_msg;
            }
        });

        //-----------------------------
        // Ctrl1スライダー更新時の処理
        //-----------------------------
        _slider_ctrl1.addEventListener('input', ()->{
            //-------------------------------------------
            // changeはだと更新随時更新されない(Firefox)
            //-------------------------------------------

            var str_value:String = _slider_ctrl1.value;

            // テキスト更新
            _text_ctrl1.textContent = str_value;
            _canvas._ctrl_module_arr[0].value = Std.parseFloat(str_value);
            _canvas._ctrl_module_arr[0].constant_update(true);

            Modified();
        });

        //-----------------------------
        // Ctrl2スライダー更新時の処理
        //-----------------------------
        _slider_ctrl2.addEventListener('input', ()->{
            //-------------------------------------------
            // changeはだと更新随時更新されない(Firefox)
            //-------------------------------------------

            var str_value:String = _slider_ctrl2.value;

            // テキスト更新
            _text_ctrl2.textContent = str_value;
            _canvas._ctrl_module_arr[1].value = Std.parseFloat(str_value);
            _canvas._ctrl_module_arr[1].constant_update(true);

            Modified();
        });

        //-----------------------------
        // Ctrl3スライダー更新時の処理
        //-----------------------------
        _slider_ctrl3.addEventListener('input', ()->{
            //-------------------------------------------
            // changeはだと更新随時更新されない(Firefox)
            //-------------------------------------------

            var str_value:String = _slider_ctrl3.value;

            // テキスト更新
            _text_ctrl3.textContent =str_value;
            _canvas._ctrl_module_arr[2].value = Std.parseFloat(str_value);
            _canvas._ctrl_module_arr[2].constant_update(true);

            Modified();
        });

        //------------------------------
        // Commitボタンクリック時の処理
        //------------------------------
        _button_commit.addEventListener('click', ()->{

            // 配置情報のJSON文字列を作成
            var json_string = haxe.Json.stringify(JsonConverter.getSaveObject(_canvas._module_arr, [ _slider_ctrl1, _slider_ctrl2, _slider_ctrl3 ]));

            // 送信
            var request:XMLHttpRequest = new XMLHttpRequest();
            request.open('POST', 'commit.cgi', false/*同期*/);
            request.send(json_string);
            if( request.status == 200 ){
                //------
                // 成功
                //------

                // ページを移動する（移動後のページで送信した保存内容を復元）
                Browser.window.location.href = Browser.window.location.pathname + '?' + request.response;
            }
            else{
                //----------------
                // 予期せぬエラー
                //----------------
                Browser.window.alert('commit error');
            }
        });

        //------------------------------
        // Revertボタンクリック時の処理
        //------------------------------
        _button_revert.addEventListener('click', ()->{
            // 再ロード
            untyped __js__('location.reload(true)');
        });

        //-----------------------------
        // Clearボタンクリック時の処理
        //-----------------------------
        _button_clear.addEventListener('click', ()->{
            // ?以降を取り除いたページに移動
            Browser.window.location.href = Browser.window.location.pathname;
        });

        var name_list:Array<String> =
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
        ImageLoader.load(name_list, Image_Loaded);
    }

    /**
     * 画像ロード完了後の処理
     * @param img_arr
     * @param Image>
     */
    static function Image_Loaded(img_map:Map < String, Image > ):Void {
       _module_creator = new ModuleCreator(img_map);

        //------------------------------
        // オリジナルのモジュールを配置
        //------------------------------

        // 加算モジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('add_module', 100, 10, false));

        // 減算モジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('subtract_module', 150, 10, false));

        // 乗算モジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('multiply_module', 200, 10, false));

        // 除算モジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('divide_module', 250, 10, false));

        // minモジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('min_module', 300, 10, false));

        // minモジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('max_module', 350, 10, false));

        // 遅延モジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('delay_module', 400, 20, false));

        // sqrtモジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('sqrt_module', 450, 20, false));

        // sinモジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('sin_module', 500, 20, false));

        // cosモジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('cos_module', 550, 20, false));

        // tanモジュール
        _canvas._original_module_arr.push(_module_creator.CreateByName('tan_module', 600, 20, false));

        //
        if( Browser.window.location.search.length > 0 ){

            // 送信
            var request:XMLHttpRequest = new XMLHttpRequest();
            request.open('POST', 'load.cgi', false/*同期*/);
            request.send( Browser.window.location.search.substring(1)/*?を取り除く*/);

            if( request.status != 200 ){
                Browser.window.alert('load error');
                return;
            }

            if( request.response.length <= 0 ){
                Browser.window.location.href = Browser.window.location.pathname;
                return;
            }

            try{
                // parse
                var loaded_data:Dynamic = haxe.Json.parse(request.response);

                //----------------
                // モジュール配置
                //----------------
                _canvas._module_arr = JsonConverter.aaa(_module_creator, loaded_data);

                _canvas._ctrl_module_arr = [];
                for ( m in _canvas._module_arr ){
                    if ( m.name == 'control_module' ) {
                        _canvas._ctrl_module_arr.push(cast m);
                    }
                    else if ( m.name == 'input_module' ) {
                        _canvas._input_module = cast m;
                    }
                    else if ( m.name == 'output_module' ) {
                        _canvas._output_module = cast m;
                    }
                }

                // control更新
                var control_info:Array<Dynamic> = loaded_data.control_info;
                for ( ctrl_idx in 0...control_info.length ) {
                    var ctrl:Dynamic = control_info[ctrl_idx];

                    var slider:InputElement;
                    if( ctrl_idx == 0 ){
                        slider = _slider_ctrl1;
                    }
                    else if( ctrl_idx == 1 ){
                        slider = _slider_ctrl2;
                    }
                    else if( ctrl_idx == 2 ){
                        slider = _slider_ctrl3;
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


                _button_clear.removeAttribute('disabled');
            }
            catch(e:Dynamic){
                Browser.window.alert('データが不正です。');
                Browser.window.location.href = Browser.window.location.pathname;
            }
        }
        else{
            // Inputモジュール
            var input_module:ModuleBase = _module_creator.CreateByName('input_module', 4, 100, false);
            _canvas._module_arr.push(input_module);
            _canvas._input_module = cast input_module;

            // Outputモジュール
            var output_module:ModuleBase = _module_creator.CreateByName('output_module', 800 - 50, 100, false);
            _canvas._module_arr.push(output_module);
            _canvas._output_module = cast output_module;

            // Controlモジュール1
            var ctrl1_module:ModuleBase = _module_creator.CreateByName('control_module', 4, 150, false);
            _canvas._module_arr.push(ctrl1_module);
            _canvas._ctrl_module_arr.push(cast ctrl1_module);

            // Controlモジュール2
            var ctrl2_module:ModuleBase = _module_creator.CreateByName('control_module', 4, 200, false);
            _canvas._module_arr.push(ctrl2_module);
            _canvas._ctrl_module_arr.push(cast ctrl2_module);

            // Controlモジュール3
            var ctrl3_module:ModuleBase = _module_creator.CreateByName('control_module', 4, 250, false);
            _canvas._module_arr.push(ctrl3_module);
            _canvas._ctrl_module_arr.push(cast ctrl3_module);

            // SanpleRateモジュール
            var samplerate_module:ModuleBase = _module_creator.CreateByName('samplerate_module', 4, 300, false);
            _canvas._module_arr.push(samplerate_module);
            _canvas._samplerate_module = cast samplerate_module;


            _slider_ctrl1.dispatchEvent(new Event('input'));
            _slider_ctrl2.dispatchEvent(new Event('input'));
            _slider_ctrl3.dispatchEvent(new Event('input'));
        }

        _button_commit.setAttribute('disabled', 'disabled');

        _button_revert.setAttribute('disabled', 'disabled');

        // ファイル選択ボタンを活動にする
        _wave_file.removeAttribute('disabled');

        _canvas.redraw();

        _edit = false;

        _canvas.calc_module_order();
    }
    
    /**
     * MIDI初期化
     * @param m
     */
    static function onMIDIInit(m:Dynamic):Void {
        var it = m.inputs.values();
        var o = it.next();
        while ( o.done == false )
        {
            Browser.document.getElementById('text_midi_in_device').textContent = o.value.name;
            o.value.onmidimessage = onmidimessage;
            o = it.next();
        }
    }
    
    /**
     * MIDIメッセージ受信時の処理
     * @param e
     */
    static function onmidimessage(e:Dynamic) {
        _text_midi_msg.textContent =
            '0x' + e.data[0].toString(16)
            + ' 0x' + e.data[1].toString(16)
            + ' 0x' + e.data[2].toString(16);
            
        _current_midi_msg = e.data[1];
        
        var t : Float = e.data[2] / 127.0;
        if ( _midi_learn1 == _current_midi_msg)
        {
            //更新
            var min1:Float = Std.parseFloat(_slider_ctrl1.getAttribute('min'));
            var max1:Float = Std.parseFloat(_slider_ctrl1.getAttribute('max'));
            _slider_ctrl1.value =  Std.string( min1 * (1 - t) + max1 * t );
            _slider_ctrl1.dispatchEvent(new Event('input'));
        }
        if ( _midi_learn2 == _current_midi_msg)
        {
            //更新
            var min2:Float = Std.parseFloat(_slider_ctrl2.getAttribute('min'));
            var max2:Float = Std.parseFloat(_slider_ctrl2.getAttribute('max'));
            _slider_ctrl2.value = Std.string( min2 * (1 - t) + max2 * t );
            _slider_ctrl2.dispatchEvent(new Event('input'));
        }
        if ( _midi_learn3 == _current_midi_msg)
        {
            //更新
            var min3:Float = Std.parseFloat(_slider_ctrl3.getAttribute('min'));
            var max3:Float = Std.parseFloat(_slider_ctrl3.getAttribute('max'));
            _slider_ctrl3.value = Std.string( min3 * (1 - t) + max3 * t );
            _slider_ctrl3.dispatchEvent(new Event('input'));
        }
    }
}
