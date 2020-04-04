import {ModuleBase} from "./module/moduleBase"
import {ConnectionEditor} from "./connectionEditor"

/**
 * 音声処理クラス.
 * @author fukuroda
 */
class AudioProcessor{
    /**
     * AudioContext.
     */
    private audio_context:AudioContext;

    /**
     * バッファ.
     */
    private decoded_buffer:AudioBuffer | null = null;

    /**
     * 再生位置.
     */
    private pos:number = 0;

    /**
     * ScriptProcessor.
     */
    private script_processor:ScriptProcessorNode | null = null;

    /**
     * 音量.
     */
    private gain:number = 0.5;

    /**
     * 異常終了時の処理.
     */
    private abnormal_end:()=>void;

    /**
     * TODO.
     */
    private canvas:ConnectionEditor;

    /**
     * constructor.
     * @param audio_context
     * @param abnormal_end
     */
    public constructor(canvas:ConnectionEditor, abnormal_end:()=>void) {
        this.canvas = canvas;
        this.audio_context = new AudioContext();
        this.abnormal_end = abnormal_end;
    }

    /**
     * 音声処理.
     * @param e
     */
    private audio_process = (e:AudioProcessingEvent) => {
        // Output取得
        var output1_arr:Float32Array = e.outputBuffer.getChannelData(0);
        var output2_arr:Float32Array = e.outputBuffer.getChannelData(1);

        // Input取得
        var input1_arr:Float32Array = this.decoded_buffer!.getChannelData(0);
        var input2_arr:Float32Array = this.decoded_buffer!.getChannelData(1);

        var module_sequence:ModuleBase[] = this.canvas._module_seqence;

        // サンプル数取得
        var breakdown:boolean = false;
        for ( var i =0; i < 1024; i++) {
            if ( this.pos < this.decoded_buffer!.length ) {
                this.canvas._input_module!.value1 = input1_arr[this.pos] * this.gain; // TODO:
                this.canvas._input_module!.value2 = input2_arr[this.pos] * this.gain; // TODO:
                this.pos++;

                for ( var m of module_sequence) {
                    m.evaluate();

                    // Output先のモジュールを更新する
                    for( var output of m.output_arr ){
                        // Output & QuickBus
                        let next_input_arr = output.next_input_arr.concat(output.quick_bus_next_input_arr);

                        for( var next_input of  next_input_arr){
                            // Output値をInput値に設定
                            next_input.value1 = output.value1;
                            next_input.value2 = output.value2;
                        }
                    }
                }

                if ( breakdown == false &&
                -10 < this.canvas._output_module!.value1 && this.canvas!._output_module!.value1 < 10 &&
                -10 < this.canvas._output_module!.value2 && this.canvas!._output_module!.value2 < 10 ){
                    output1_arr[i] = this.canvas!._output_module!.value1;
                    output2_arr[i] = this.canvas!._output_module!.value2;
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
     * @param gain 音量
     */
    public update_gain(gain:number):void {
        this.gain = gain;
    }

    /**
     * 再生開始.
     * @param canvas
     * @param decoded_buffer
     */
    public start(decoded_buffer:AudioBuffer) {
        // バッファを設定
        this.decoded_buffer = decoded_buffer;

        // 再生位置をリセット
        this.pos = 0;

        //----------------
        // 開始（毎回接続する）
        //----------------

        // ScriptProcessor設定
        this.script_processor = this.audio_context!.createScriptProcessor(1024, 0, 2);
        this.script_processor.onaudioprocess = this.audio_process;

        // 接続
        this.script_processor.connect(this.audio_context!.destination, 0, 0);
    }

    /**
     * 再生停止.
     */
    public stop():void {
        // 切断
        this.script_processor!.disconnect(0);

        // ScriptProcessorを無効にする
        this.script_processor!.onaudioprocess = null;
        this.script_processor = null;
    }
}

export{AudioProcessor}