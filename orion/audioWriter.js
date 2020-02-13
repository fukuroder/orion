class AudioWriter {
    constructor(canvas, decoded_buffer) {
        this.canvas = canvas;
        this.decoded_buffer = decoded_buffer;
    }
    start() {
        var output = new Float32Array(2 * this.decoded_buffer.length);
        var input1_arr = this.decoded_buffer.getChannelData(0);
        var input2_arr = this.decoded_buffer.getChannelData(1);
        var module_sequence = this.canvas._module_seqence;
        var maxvalue = 0.0;
        for (var i = 0; i < this.decoded_buffer.length; i++) {
            this.canvas._input_module.value1 = input1_arr[i];
            this.canvas._input_module.value2 = input2_arr[i];
            for (var m of module_sequence) {
                m.evaluate();
                for (var o of m.output_arr) {
                    for (var next_input of o.next_input_arr) {
                        next_input.value1 = o.value1;
                        next_input.value2 = o.value2;
                    }
                    for (var next_input of o.quick_bus_next_input_arr) {
                        next_input.value1 = o.value1;
                        next_input.value2 = o.value2;
                    }
                }
            }
            if (-10 < this.canvas._output_module.value1 && this.canvas._output_module.value1 < 10 &&
                -10 < this.canvas._output_module.value2 && this.canvas._output_module.value2 < 10) {
                output[2 * i] = this.canvas._output_module.value1;
                output[2 * i + 1] = this.canvas._output_module.value2;
                if (maxvalue < Math.abs(this.canvas._output_module.value1))
                    maxvalue = Math.abs(this.canvas._output_module.value1);
                if (maxvalue < Math.abs(this.canvas._output_module.value2))
                    maxvalue = Math.abs(this.canvas._output_module.value2);
            }
            else {
                return null;
            }
        }
        if (maxvalue == 0.0) {
            return null;
        }
        var wavdata = new ArrayBuffer(44 + output.length * 2);
        var view = new DataView(wavdata);
        view.setUint8(0, 82);
        view.setUint8(1, 73);
        view.setUint8(2, 70);
        view.setUint8(3, 70);
        view.setUint32(4, 32 + this.decoded_buffer.length * 2, true);
        view.setUint8(8, 87);
        view.setUint8(9, 65);
        view.setUint8(10, 86);
        view.setUint8(11, 69);
        view.setUint8(12, 102);
        view.setUint8(13, 109);
        view.setUint8(14, 116);
        view.setUint8(15, 32);
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 2, true);
        view.setUint32(24, Math.round(this.decoded_buffer.sampleRate), true);
        view.setUint32(28, Math.round(this.decoded_buffer.sampleRate) * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);
        view.setUint8(36, 100);
        view.setUint8(37, 97);
        view.setUint8(38, 116);
        view.setUint8(39, 97);
        view.setUint32(40, output.length * 2, true);
        for (var i = 0; i < output.length; i++) {
            view.setInt16(44 + 2 * i, Math.round(output[i] * 32768 / maxvalue), true);
        }
        return wavdata;
    }
}
export { AudioWriter };
