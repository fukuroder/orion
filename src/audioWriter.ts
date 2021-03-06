import {ModuleBase} from "./module/moduleBase"
import {ConnectionEditor} from "./connectionEditor"

/**
 * 音声処理クラス.
 * @author fukuroda
 */
class AudioWriter{

    /**
     * バッファ.
     */
    private decoded_buffer:AudioBuffer;

    /**
     * TODO.
     */
    private canvas:ConnectionEditor;

    /**
     * constructor.
     * @param audio_context
     * @param abnormal_end
     */
    public constructor(canvas:ConnectionEditor, decoded_buffer:AudioBuffer) {
        this.canvas = canvas;
        this.decoded_buffer = decoded_buffer;
    }

    /**
     * 音声処理.
     * @param e
     */
    public start():ArrayBuffer|null{

        // Output取得
        var output:Float32Array = new Float32Array(2 * this.decoded_buffer.length);

        //Browser.window.alert("output.length="+output.length);

        // Input取得
        var input1_arr:Float32Array = this.decoded_buffer.getChannelData(0);
        var input2_arr:Float32Array = this.decoded_buffer.getChannelData(1);

        var module_sequence:ModuleBase[] = this.canvas._module_seqence;

        var maxvalue = 0.0;
        for ( var i = 0; i<this.decoded_buffer.length; i++) {
            this.canvas._input_module!.value1 = input1_arr[i];
            this.canvas._input_module!.value2 = input2_arr[i];

            for ( var m of module_sequence) {
                m.evaluate();

                // Output先のモジュールを更新する
                for( var o of m.output_arr ){
                    // Output & QuickBus
                    let next_input_arr = o.next_input_arr.concat(o.quick_bus_next_input_arr);

                    for( var next_input of next_input_arr ){
                        // Output値をInput値に設定
                        next_input.value1 = o.value1;
                        next_input.value2 = o.value2;
                    }
                }
            }

            if ( -10 < this.canvas._output_module!.value1 && this.canvas._output_module!.value1 < 10 &&
                 -10 < this.canvas._output_module!.value2 && this.canvas._output_module!.value2 < 10 ){
                output[2 * i] = this.canvas._output_module!.value1;
                output[2 * i + 1] = this.canvas._output_module!.value2;

                // 最大値更新
                if ( maxvalue < Math.abs(this.canvas._output_module!.value1) ) maxvalue = Math.abs(this.canvas._output_module!.value1);
                if ( maxvalue < Math.abs(this.canvas._output_module!.value2) ) maxvalue = Math.abs(this.canvas._output_module!.value2);
            }
            else{
                //-----
                // 破綻
                //-----
                return null;
            }
        }

        if ( maxvalue == 0.0 )
        {
            return null;
        }

        var wavdata:ArrayBuffer = new ArrayBuffer(44 + output.length * 2);
        var view:DataView = new DataView(wavdata);

        // RIFF
        view.setUint8(0, 82);//'R' 82
        view.setUint8(1, 73);//'I' 73
        view.setUint8(2, 70);//'F' 70
        view.setUint8(3, 70);//'F' 70

        // file length
        view.setUint32(4, 32 + this.decoded_buffer.length * 2, true);

        // WAVEfmt
        view.setUint8(8, 87);//'W' 87
        view.setUint8(9, 65);//'A' 65
        view.setUint8(10, 86);//'V' 86
        view.setUint8(11, 69);//'E' 69
        view.setUint8(12, 102);//'f' 102
        view.setUint8(13, 109);//'m' 109
        view.setUint8(14, 116);//'t' 116
        view.setUint8(15, 32);//' ' 32

        // format chunk length
        view.setUint32(16, 16, true);

        // sample format
        view.setUint16(20, 1, true);

        // channels
        view.setUint16(22, 2, true);

        // sample rate
        view.setUint32(24, Math.round(this.decoded_buffer.sampleRate), true);

        // byte rate
        view.setUint32(28, Math.round(this.decoded_buffer.sampleRate) * 4, true);

        // block align
        view.setUint16(32, 4, true);

        // bits per sample
        view.setUint16(34, 16, true);

        // data
        view.setUint8(36, 100);//'d' 100
        view.setUint8(37, 97);//'a' 97
        view.setUint8(38, 116);//'t' 116
        view.setUint8(39, 97);//'a' 97

        /* data chunk length */
        view.setUint32(40, output.length * 2, true);

        for (var i=0; i<output.length; i++) {
            view.setInt16(44 + 2 * i, Math.round(output[i] * 32768 / maxvalue), true);
        }

        return wavdata;
    }
}

export{AudioWriter}