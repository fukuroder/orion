package ;
import js.html.audio.AudioBuffer;
import js.html.audio.AudioContext;
import js.html.audio.ScriptProcessorNode;
import module.ModuleBase;

/**
 * 音声処理クラス.
 * @author fukuroda
 */
class AudioProcessor{
    /**
     * AudioContext.
     */
    var audio_context:AudioContext;

    /**
     * バッファ.
     */
    var decoded_buffer:AudioBuffer;

    /**
     * 再生位置.
     */
    var pos:Int = 0;

    /**
     * ScriptProcessor.
     */
    var script_processor:ScriptProcessorNode;

    /**
     * 音量.
     */
    var gain:Float = 0.5;

    /**
     * 異常終了時の処理.
     */
    var abnormal_end:Dynamic;

    /**
     * TODO.
     */
    var canvas:ConnectionEditor;

    /**
     * コンストラクタ.
     * @param audio_context
     * @param abnormal_end
     */
    public function new(canvas:ConnectionEditor, abnormal_end) {
        this.canvas = canvas;
        this.audio_context = new AudioContext();
        this.abnormal_end = abnormal_end;
    }

    /**
     * 音声処理.
     * @param e
     */
    function audio_process(e):Void {
        // Output取得
        var output1_arr:js.lib.Float32Array = e.outputBuffer.getChannelData(0);
        var output2_arr:js.lib.Float32Array = e.outputBuffer.getChannelData(1);

        // Input取得
        var input1_arr:js.lib.Float32Array = this.decoded_buffer.getChannelData(0);
        var input2_arr:js.lib.Float32Array = this.decoded_buffer.getChannelData(1);

        var module_sequence:Array<ModuleBase> = canvas._module_seqence;

        // サンプル数取得
        var breakdown:Bool = false;
        for ( i in 0...1024) {
            if ( pos < this.decoded_buffer.length ) {
                this.canvas._input_module.value1 = input1_arr[pos] * this.gain; // TODO:
                this.canvas._input_module.value2 = input2_arr[pos] * this.gain; // TODO:
                pos++;

                for ( m in module_sequence) {
                    m.evaluate();

                    // Output先のモジュールを更新する
                    for( output in m.output_arr ){
                        for( next_input in output.next_input_arr ){
                            // Output値をInput値に設定
                            next_input.value1 = output.value1;
                            next_input.value2 = output.value2;
                        }

                        // QuickBus
                        for( next_input in output.quick_bus_next_input_arr ){
                            // Output値をInput値に設定
                            next_input.value1 = output.value1;
                            next_input.value2 = output.value2;
                        }
                    }
                }

                if ( breakdown == false &&
                -10 < this.canvas._output_module.value1 && this.canvas._output_module.value1 < 10 &&
                -10 < this.canvas._output_module.value2 && this.canvas._output_module.value2 < 10 ){
                    output1_arr[i] = this.canvas._output_module.value1;
                    output2_arr[i] = this.canvas._output_module.value2;
                }
                else{
                    //-----
                    // 破綻
                    //-----
                    breakdown = true;
                    output1_arr[i] = output2_arr[i] = 0.0;
                }
            }
            else {
                output1_arr[i] = output2_arr[i] = 0.0;
            }
        }

        if( breakdown ){
            //----------------
            // 再生を停止する
            //----------------

            this.stop();

            this.abnormal_end();
        }
    }

    /**
     * 音量更新.
     * @param gain　音量
     */
    public function update_gain(gain:Float):Void {
        this.gain = gain;
    }

    /**
     * 再生開始.
     * @param canvas
     * @param decoded_buffer
     */
    public function start(decoded_buffer:AudioBuffer) {
        // バッファを設定
        this.decoded_buffer = decoded_buffer;

        // 再生位置をリセット
        this.pos = 0;

        //----------------
        // 開始（毎回接続する）
        //----------------

        // ScriptProcessor設定
        this.script_processor = this.audio_context.createScriptProcessor(1024, 0, 2);
        this.script_processor.onaudioprocess = this.audio_process;

        // 接続
        this.script_processor.connect(this.audio_context.destination, 0, 0);
    }

    /**
     * 再生停止.
     */
    public function stop():Void {
        // 切断
        this.script_processor.disconnect(0);

        // ScriptProcessorを無効にする
        this.script_processor.onaudioprocess = null;
        this.script_processor = null;
    }
}
