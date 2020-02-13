class AudioProcessor {
    constructor(canvas, abnormal_end) {
        this.decoded_buffer = null;
        this.pos = 0;
        this.script_processor = null;
        this.gain = 0.5;
        this.audio_process = (e) => {
            var output1_arr = e.outputBuffer.getChannelData(0);
            var output2_arr = e.outputBuffer.getChannelData(1);
            var input1_arr = this.decoded_buffer.getChannelData(0);
            var input2_arr = this.decoded_buffer.getChannelData(1);
            var module_sequence = this.canvas._module_seqence;
            var breakdown = false;
            for (var i = 0; i < 1024; i++) {
                if (this.pos < this.decoded_buffer.length) {
                    this.canvas._input_module.value1 = input1_arr[this.pos] * this.gain;
                    this.canvas._input_module.value2 = input2_arr[this.pos] * this.gain;
                    this.pos++;
                    for (var m of module_sequence) {
                        m.evaluate();
                        for (var output of m.output_arr) {
                            for (var next_input of output.next_input_arr) {
                                next_input.value1 = output.value1;
                                next_input.value2 = output.value2;
                            }
                            for (var next_input of output.quick_bus_next_input_arr) {
                                next_input.value1 = output.value1;
                                next_input.value2 = output.value2;
                            }
                        }
                    }
                    if (breakdown == false &&
                        -10 < this.canvas._output_module.value1 && this.canvas._output_module.value1 < 10 &&
                        -10 < this.canvas._output_module.value2 && this.canvas._output_module.value2 < 10) {
                        output1_arr[i] = this.canvas._output_module.value1;
                        output2_arr[i] = this.canvas._output_module.value2;
                    }
                    else {
                        breakdown = true;
                        output1_arr[i] = output2_arr[i] = 0.0;
                    }
                }
                else {
                    output1_arr[i] = output2_arr[i] = 0.0;
                }
            }
            if (breakdown) {
                this.stop();
                this.abnormal_end();
            }
        };
        this.canvas = canvas;
        this.audio_context = new AudioContext();
        this.abnormal_end = abnormal_end;
    }
    update_gain(gain) {
        this.gain = gain;
    }
    start(decoded_buffer) {
        this.decoded_buffer = decoded_buffer;
        this.pos = 0;
        this.script_processor = this.audio_context.createScriptProcessor(1024, 0, 2);
        this.script_processor.onaudioprocess = this.audio_process;
        this.script_processor.connect(this.audio_context.destination, 0, 0);
    }
    stop() {
        this.script_processor.disconnect(0);
        this.script_processor.onaudioprocess = null;
        this.script_processor = null;
    }
}
export { AudioProcessor };
