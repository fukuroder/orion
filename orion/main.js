import { AudioFileReader } from "./audioFileReader.js";
import { AudioProcessor } from "./audioProcessor.js";
import { AudioWriter } from "./audioWriter.js";
import { ConnectionEditor } from "./connectionEditor.js";
import { ImageLoader } from "./imageLoader.js";
import { JsonConverter } from "./jsonConverter.js";
import { ModuleCreator } from "./moduleCreator.js";
import { RecentLoader } from "./recentLoader.js";
class Main {
    static squareDistance(x1, y1, x2, y2) {
        return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    }
    static getOffset(e) {
        var target = e.target;
        return { x: e.pageX - target.offsetLeft, y: e.pageY - target.offsetTop };
    }
    static editSlider(slider) {
        do {
            var str = prompt('Input min, max, step.', slider.getAttribute('min') + ', ' + slider.getAttribute('max') + ', ' + slider.getAttribute('step'));
            if (str == null) {
                return false;
            }
            if (str == '') {
                slider.setAttribute('min', '0.0');
                slider.setAttribute('max', '1.0');
                slider.setAttribute('step', '0.01');
                slider.value = '0.5';
            }
            else {
                var str_split = str.split(',');
                if (str_split.length != 3) {
                    continue;
                }
                var min_str = str_split[0];
                var max_str = str_split[1];
                var step_str = str_split[2];
                var min = Number(min_str);
                var max = Number(max_str);
                var step = Number(step_str);
                if (isNaN(min) || isNaN(max) || isNaN(step)) {
                    continue;
                }
                if (min >= max) {
                    continue;
                }
                if (step <= 0.0) {
                    continue;
                }
                var value = parseFloat(slider.value);
                if (value < min) {
                    value = min;
                }
                else if (max < value) {
                    value = max;
                }
                slider.setAttribute('min', min.toString());
                slider.setAttribute('max', max.toString());
                slider.setAttribute('step', step.toString());
                slider.value = value.toString();
            }
            break;
        } while (true);
        slider.dispatchEvent(new Event('input'));
        return true;
    }
    static Modified() {
        if (Main._edit == false) {
            Main._button_commit.removeAttribute('disabled');
            Main._button_revert.removeAttribute('disabled');
            Main._button_clear.removeAttribute('disabled');
            Main._edit = true;
        }
    }
    static confirm_removing_module() {
        var delete_ok = false;
        if (Main._canvas.drag_module.removable == true) {
            Main._display_prompt = true;
            delete_ok = confirm('May the module be deleted?');
            Main._display_prompt = false;
        }
        if (delete_ok == true) {
            Main._canvas._module_arr.pop().removeModule();
            Main._canvas.calc_module_order();
        }
        else {
            Main._canvas.cancel_module_drag();
        }
    }
    static quick_edit_input(input) {
        var org_busName = '';
        if (input.quick_const != '') {
            org_busName = input.quick_const;
        }
        else if (input.prev_output != null) {
            org_busName = input.prev_output.quick_bus_name;
        }
        Main._display_prompt = true;
        var q_bus_or_const_name = prompt('Input QuickBus or QuickConst.', org_busName);
        Main._display_prompt = false;
        if (q_bus_or_const_name != null && q_bus_or_const_name != org_busName) {
            if (q_bus_or_const_name == '') {
                input.update_quick_const('', 0.0);
                if (input.prev_output != null) {
                    input.prev_output.disconnect_quickbus(input);
                }
            }
            else {
                var q_const = Number(q_bus_or_const_name);
                if (isNaN(q_const) == false) {
                    if (input.prev_output != null) {
                        input.prev_output.disconnect_quickbus(input);
                    }
                    input.update_quick_const(q_bus_or_const_name, q_const);
                }
                else {
                    input.update_quick_const('', 0.0);
                    var new_output = Main._canvas.getResisterdQuickBus(q_bus_or_const_name);
                    if (new_output != null) {
                        if (input.prev_output != null) {
                            input.prev_output.disconnect_quickbus(input);
                        }
                        if (input.module.isLoop(new_output.module)) {
                            alert('A recursive loop was detected.');
                        }
                        else {
                            new_output.connect_quickbus(input);
                        }
                    }
                    else {
                        alert('The input name is not registered as QuickBus.');
                    }
                }
            }
            Main._canvas.calc_module_order();
        }
    }
    static quick_edit_output(output) {
        Main._display_prompt = true;
        var q_bus_name = prompt('Input QuickBus.', output.quick_bus_name);
        Main._display_prompt = false;
        if (q_bus_name != null && q_bus_name != output.quick_bus_name) {
            if (q_bus_name == '') {
                output.disconnect_quickbus();
            }
            else {
                var q_const = Number(q_bus_name);
                if (isNaN(q_const)) {
                    var used_output = Main._canvas.getResisterdQuickBus(q_bus_name);
                    if (used_output != null) {
                        alert('The input name has been already registered as QuickBus.');
                    }
                    else {
                        output.quick_bus_name = q_bus_name;
                    }
                }
                else {
                    alert('The input name has an error as QuickBus.');
                }
            }
            Main._canvas.calc_module_order();
        }
    }
    static mousedown(e) {
        if (e.button != 0) {
            return;
        }
        Main._moved = false;
        var offset = Main.getOffset(e);
        var connected_input = Main._canvas.getConnectedInput(offset);
        if (connected_input != null) {
            var output = connected_input.prev_output;
            output.disconnect(connected_input);
            Main._canvas.calc_module_order();
            Main._canvas.start_cable_drag(output, null);
            Main._moved = true;
        }
        else {
            var input = Main._canvas.getHitModuleInput(offset);
            if (input != null) {
                Main._canvas.start_cable_drag(null, input);
            }
            else {
                var output = Main._canvas.getHitModuleOutput(offset);
                if (output != null) {
                    Main._canvas.start_cable_drag(output, null);
                }
                else {
                    var module = Main._canvas.getHitModule(offset);
                    if (module != null) {
                        Main._canvas._module_arr.splice(Main._canvas._module_arr.indexOf(module), 1);
                        Main._canvas._module_arr.push(module);
                        Main._canvas.start_module_drag(module, offset.x, offset.y);
                    }
                    else {
                        var original_module = Main._canvas.getHitModule2222(offset);
                        if (original_module != null) {
                            Main._canvas.start_module_drag(original_module, offset.x, offset.y);
                        }
                    }
                }
            }
            Main._moved = false;
        }
    }
    static mousemove(e) {
        if (Main._display_prompt == true) {
            return;
        }
        var offset = Main.getOffset(e);
        if (Main._canvas.is_cable_dragging() == false && Main._canvas.drag_module == null) {
            return;
        }
        if (Main._canvas.is_cable_dragging()) {
            var p = Main._canvas.get_cable_point();
            Main._moved = Main._moved || (Main.squareDistance(p.x, p.y, offset.x, offset.y) >= 10 * 10);
        }
        else if (Main._canvas.drag_module != null) {
            var all = (Main._canvas._original_module_arr.indexOf(Main._canvas.drag_module) >= 0);
            var inside = Main._canvas.is_module_inside_view(all);
            if (inside == false) {
                Main.confirm_removing_module();
                Main._canvas.drag_module = null;
            }
            else {
                Main._canvas.end_module_drag(offset);
            }
        }
        Main._canvas.redraw();
        if (Main._canvas.is_cable_dragging()) {
            var p = Main._canvas.get_cable_point();
            Main._canvas.drawLine(p.x, p.y, offset.x, offset.y);
        }
    }
    static mouseup(e) {
        var offset = Main.getOffset(e);
        Main.Modified();
        if (Main._canvas.is_cable_dragging()) {
            if (Main._canvas.end != null) {
                if (Main._moved == false) {
                    Main.quick_edit_input(Main._canvas.end);
                }
                else {
                    if (Main._canvas.end.quick_const != '') {
                    }
                    else if (Main._canvas.end.prev_output != null) {
                    }
                    else {
                        var output = Main._canvas.getHitModuleOutput(offset);
                        if (output != null) {
                            if (output.module != Main._canvas.end.module) {
                                if (Main._canvas.end.module.isLoop(output.module)) {
                                    alert('A recursive loop was detected.');
                                }
                                else {
                                    output.connect(Main._canvas.end);
                                    Main._canvas.calc_module_order();
                                }
                            }
                        }
                    }
                }
            }
            else {
                if (Main._moved == false) {
                    Main.quick_edit_output(Main._canvas.start);
                }
                else {
                    var input = Main._canvas.getHitModuleInput(offset);
                    if (input != null) {
                        if (input.quick_const != '') {
                        }
                        else {
                            if (input.module != Main._canvas.start.module) {
                                if (input.prev_output == null) {
                                    if (input.module.isLoop(Main._canvas.start.module)) {
                                        alert('A recursive loop was detected.');
                                    }
                                    else {
                                        Main._canvas.start.connect(input);
                                        Main._canvas.calc_module_order();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            Main._canvas.start = null;
            Main._canvas.end = null;
        }
        else if (Main._canvas.drag_module != null) {
            if (Main._canvas._original_module_arr.indexOf(Main._canvas.drag_module) >= 0) {
                var inside = Main._canvas.is_module_inside_view(false);
                if (inside == true) {
                    var org_m = Main._canvas.drag_module;
                    var newmodule = Main._module_creator.CreateByName(org_m.name, org_m.x, org_m.y);
                    Main._canvas._module_arr.push(newmodule);
                }
                Main._canvas.cancel_module_drag();
            }
            Main._canvas.drag_module = null;
        }
        Main._canvas.redraw();
    }
    static mouseout(e) {
        if (Main._display_prompt == true) {
            return;
        }
        if (Main._canvas.is_cable_dragging() == false && Main._canvas.drag_module == null) {
            return;
        }
        if (Main._canvas.is_cable_dragging()) {
            Main._canvas.start = null;
            Main._canvas.end = null;
        }
        else if (Main._canvas.drag_module != null) {
            Main.confirm_removing_module();
            Main._canvas.drag_module = null;
        }
        Main._canvas.redraw();
    }
    static recent_backward_click() {
        var aaa = Main._recent_loader.get_recent_backward();
        if (aaa != null) {
            Main._select_recent.textContent = '';
            for (var option of aaa.recent_select) {
                var option_element = document.createElement('option');
                option_element.value = option.value;
                option_element.text = option.html;
                Main._select_recent.appendChild(option_element);
            }
            Main._recent_range.textContent = aaa.recent_range;
        }
    }
    static recent_forward_click() {
        var aaa = Main._recent_loader.get_recent_forward();
        if (aaa != null) {
            Main._select_recent.textContent = '';
            for (var option of aaa.recent_select) {
                var option_element = document.createElement('option');
                option_element.value = option.value;
                option_element.text = option.html;
                Main._select_recent.appendChild(option_element);
            }
            Main._recent_range.textContent = aaa.recent_range;
        }
    }
    static recent_load_click() {
        var selected_index = Main._select_recent.selectedIndex;
        var selected_option = Main._select_recent.options[selected_index];
        location.href = location.pathname + '?' + selected_option.value;
    }
    static audio_error() {
        alert('An abnormal input signal was detected.');
        Main._wave_play.value = 'Play';
        Main._wave_file.removeAttribute('disabled');
    }
    static wave_play_click() {
        if (Main._wave_play.value == 'Stop') {
            Main._audio_processor.stop();
            Main._wave_play.value = 'Play';
            Main._wave_save.removeAttribute('disabled');
            Main._wave_file.removeAttribute('disabled');
        }
        else {
            Main._wave_play.value = 'Stop';
            Main._wave_save.setAttribute('disabled', 'disabled');
            Main._wave_file.setAttribute('disabled', 'disabled');
            for (var m of Main._canvas._module_arr) {
                if (m.name == 'samplerate_module') {
                    m.output_arr[0].value1 = Main._audio_context.sampleRate;
                    m.output_arr[0].value2 = Main._audio_context.sampleRate;
                    m.constant_update(true);
                }
                if (m.name == 'delay_module') {
                    m.input_arr[0].value1 = 0.0;
                    m.input_arr[0].value2 = 0.0;
                }
            }
            Main._audio_processor.start(Main._decodedBuffer);
        }
    }
    static wave_save_click() {
        for (var m of Main._canvas._module_arr) {
            if (m.name == 'samplerate_module') {
                m.output_arr[0].value1 = Main._audio_context.sampleRate;
                m.output_arr[0].value2 = Main._audio_context.sampleRate;
                m.constant_update(true);
            }
            if (m.name == 'delay_module') {
                m.input_arr[0].value1 = 0.0;
                m.input_arr[0].value2 = 0.0;
            }
        }
        var rander = new AudioWriter(Main._canvas, Main._decodedBuffer);
        var wavebuf = rander.start();
        if (wavebuf != null) {
            var blob = new Blob([wavebuf], { "type": 'audio/wav' });
            open(URL.createObjectURL(blob), "");
        }
        else {
            alert("???");
        }
    }
    static decodeFinished(buffer) {
        Main._decodedBuffer = buffer;
        Main._wave_play.removeAttribute('disabled');
        Main._wave_save.removeAttribute('disabled');
        Main._wave_file.removeAttribute('disabled');
        return true;
    }
    ;
    static wave_file_change(e) {
        var _a;
        Main._wave_play.setAttribute('disabled', 'disabled');
        Main._wave_save.setAttribute('disabled', 'disabled');
        var file_selector = e.target;
        if (((_a = file_selector.files) === null || _a === void 0 ? void 0 : _a.length) == 0) {
            return;
        }
        var audiofile = file_selector.files[0];
        if (audiofile.type != 'audio/wav'
            && audiofile.type != 'audio/ogg'
            && audiofile.type != 'video/ogg') {
            file_selector.value = '';
            alert('Please select wav/ogg file.');
            return;
        }
        Main._wave_file.setAttribute('disabled', 'disabled');
        Main._audio_file_loader.load(audiofile);
    }
    static windowLoaded() {
        Main._button_clear = document.getElementById('button_clear');
        Main._button_commit = document.getElementById('button_commit');
        Main._text_midi_msg = document.getElementById('text_midi_msg');
        Main._button_ctrl1 = document.getElementById('button_ctrl1');
        Main._button_ctrl2 = document.getElementById('button_ctrl2');
        Main._button_ctrl3 = document.getElementById('button_ctrl3');
        Main._button_learn1 = document.getElementById('button_learn1');
        Main._button_learn2 = document.getElementById('button_learn2');
        Main._button_learn3 = document.getElementById('button_learn3');
        Main._button_revert = document.getElementById('button_revert');
        Main._recent_backward = document.getElementById('recent_backward');
        Main._recent_forward = document.getElementById('recent_forward');
        Main._recent_load = document.getElementById('recent_load');
        Main._recent_range = document.getElementById('recent_range');
        Main._select_recent = document.getElementById('select_recent');
        Main._slider_ctrl1 = document.getElementById('slider_ctrl1');
        Main._slider_ctrl2 = document.getElementById('slider_ctrl2');
        Main._slider_ctrl3 = document.getElementById('slider_ctrl3');
        Main._slider_volume = document.getElementById('slider_volume');
        Main._text_ctrl1 = document.getElementById('text_ctrl1');
        Main._text_ctrl2 = document.getElementById('text_ctrl2');
        Main._text_ctrl3 = document.getElementById('text_ctrl3');
        Main._text_volume = document.getElementById('text_volume');
        Main._wave_file = document.getElementById('wave_file');
        Main._wave_play = document.getElementById('wave_play');
        Main._wave_save = document.getElementById('wave_save');
        Main._work_view = document.getElementById('work_view');
        Main._wave_play.setAttribute('disabled', 'disabled');
        Main._wave_save.setAttribute('disabled', 'disabled');
        var navigator = window.navigator;
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(Main.onMIDIInit);
        }
        else {
            alert("navigator.requestMIDIAccess == null");
        }
        Main._work_view.setAttribute('width', (800).toString());
        Main._work_view.setAttribute('height', (400).toString());
        Main._canvas = new ConnectionEditor(Main._work_view);
        Main._recent_loader = new RecentLoader();
        Main._recent_backward.addEventListener("click", Main.recent_backward_click);
        Main._recent_forward.addEventListener("click", Main.recent_forward_click);
        Main._recent_load.addEventListener("click", Main.recent_load_click);
        Main._wave_play.addEventListener("click", Main.wave_play_click);
        Main._wave_save.addEventListener("click", Main.wave_save_click);
        Main._wave_file.addEventListener("change", Main.wave_file_change);
        Main._slider_volume.addEventListener('input', (e) => {
            var srt_value = Main._slider_volume.value;
            Main._text_volume.textContent = srt_value;
            Main._audio_processor.update_gain(parseFloat(srt_value));
        });
        Main._audio_context = new AudioContext();
        if (Main._audio_context == null) {
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
        Main._audio_file_loader = new AudioFileReader(Main.decodeFinished, () => { });
        Main._audio_processor = new AudioProcessor(Main._canvas, Main.audio_error);
        Main._slider_volume.dispatchEvent(new Event('input'));
        Main._work_view.addEventListener('mousedown', Main.mousedown);
        Main._work_view.addEventListener('mousemove', Main.mousemove);
        Main._work_view.addEventListener('mouseup', Main.mouseup);
        Main._work_view.addEventListener('mouseout', Main.mouseout);
        Main._button_ctrl1.addEventListener('click', () => {
            var success = Main.editSlider(Main._slider_ctrl1);
            if (success == true) {
                Main.Modified();
            }
        });
        Main._button_ctrl2.addEventListener('click', () => {
            var success = Main.editSlider(Main._slider_ctrl2);
            if (success == true) {
                Main.Modified();
            }
        });
        Main._button_ctrl3.addEventListener('click', () => {
            var success = Main.editSlider(Main._slider_ctrl3);
            if (success == true) {
                Main.Modified();
            }
        });
        Main._button_learn1.addEventListener('click', () => {
            if (Main._current_midi_msg >= 0) {
                Main._midi_learn1 = Main._current_midi_msg;
            }
        });
        Main._button_learn2.addEventListener('click', () => {
            if (Main._current_midi_msg >= 0) {
                Main._midi_learn2 = Main._current_midi_msg;
            }
        });
        Main._button_learn3.addEventListener('click', () => {
            if (Main._current_midi_msg >= 0) {
                Main._midi_learn3 = Main._current_midi_msg;
            }
        });
        Main._slider_ctrl1.addEventListener('input', () => {
            var str_value = Main._slider_ctrl1.value;
            Main._text_ctrl1.textContent = str_value;
            Main._canvas._ctrl_module_arr[0].value = parseFloat(str_value);
            Main._canvas._ctrl_module_arr[0].constant_update(true);
            Main.Modified();
        });
        Main._slider_ctrl2.addEventListener('input', () => {
            var str_value = Main._slider_ctrl2.value;
            Main._text_ctrl2.textContent = str_value;
            Main._canvas._ctrl_module_arr[1].value = parseFloat(str_value);
            Main._canvas._ctrl_module_arr[1].constant_update(true);
            Main.Modified();
        });
        Main._slider_ctrl3.addEventListener('input', () => {
            var str_value = Main._slider_ctrl3.value;
            Main._text_ctrl3.textContent = str_value;
            Main._canvas._ctrl_module_arr[2].value = parseFloat(str_value);
            Main._canvas._ctrl_module_arr[2].constant_update(true);
            Main.Modified();
        });
        Main._button_commit.addEventListener('click', () => {
            var json_string = JSON.stringify(JsonConverter.getSaveObject(Main._canvas._module_arr, [Main._slider_ctrl1, Main._slider_ctrl2, Main._slider_ctrl3]));
            var request = new XMLHttpRequest();
            request.open('POST', 'commit.cgi', false);
            request.send(json_string);
            if (request.status == 200) {
                location.href = location.pathname + '?' + request.response;
            }
            else {
                alert('commit error');
            }
        });
        Main._button_revert.addEventListener('click', () => {
            location.reload(true);
        });
        Main._button_clear.addEventListener('click', () => {
            location.href = location.pathname;
        });
        var name_list = [
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
    static Image_Loaded(img_map) {
        Main._module_creator = new ModuleCreator(img_map);
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('add_module', 100, 10, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('subtract_module', 150, 10, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('multiply_module', 200, 10, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('divide_module', 250, 10, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('min_module', 300, 10, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('max_module', 350, 10, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('delay_module', 400, 20, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('sqrt_module', 450, 20, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('sin_module', 500, 20, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('cos_module', 550, 20, false));
        Main._canvas._original_module_arr.push(Main._module_creator.CreateByName('tan_module', 600, 20, false));
        if (location.search.length > 0) {
            var request = new XMLHttpRequest();
            request.open('POST', 'load.cgi', false);
            request.send(location.search.substring(1));
            if (request.status != 200) {
                alert('load error');
                return;
            }
            if (request.response.length <= 0) {
                location.href = location.pathname;
                return;
            }
            try {
                var loaded_data = JSON.parse(request.response);
                Main._canvas._module_arr = JsonConverter.aaa(Main._module_creator, loaded_data);
                Main._canvas._ctrl_module_arr = [];
                for (var m of Main._canvas._module_arr) {
                    if (m.name == 'control_module') {
                        Main._canvas._ctrl_module_arr.push(m);
                    }
                    else if (m.name == 'input_module') {
                        Main._canvas._input_module = m;
                    }
                    else if (m.name == 'output_module') {
                        Main._canvas._output_module = m;
                    }
                }
                var control_info = loaded_data.control_info;
                for (var ctrl_idx = 0; ctrl_idx < control_info.length; ctrl_idx++) {
                    var ctrl = control_info[ctrl_idx];
                    var slider;
                    if (ctrl_idx == 0) {
                        slider = Main._slider_ctrl1;
                    }
                    else if (ctrl_idx == 1) {
                        slider = Main._slider_ctrl2;
                    }
                    else if (ctrl_idx == 2) {
                        slider = Main._slider_ctrl3;
                    }
                    else {
                        return;
                    }
                    slider.setAttribute('min', ctrl.min);
                    slider.setAttribute('max', ctrl.max);
                    slider.setAttribute('step', ctrl.step);
                    slider.value = ctrl.value;
                    slider.dispatchEvent(new Event('input'));
                }
                Main._button_clear.removeAttribute('disabled');
            }
            catch (e) {
                alert('データが不正です。');
                location.href = location.pathname;
            }
        }
        else {
            var input_module = Main._module_creator.CreateByName('input_module', 4, 100, false);
            Main._canvas._module_arr.push(input_module);
            Main._canvas._input_module = input_module;
            var output_module = Main._module_creator.CreateByName('output_module', 800 - 50, 100, false);
            Main._canvas._module_arr.push(output_module);
            Main._canvas._output_module = output_module;
            var ctrl1_module = Main._module_creator.CreateByName('control_module', 4, 150, false);
            Main._canvas._module_arr.push(ctrl1_module);
            Main._canvas._ctrl_module_arr.push(ctrl1_module);
            var ctrl2_module = Main._module_creator.CreateByName('control_module', 4, 200, false);
            Main._canvas._module_arr.push(ctrl2_module);
            Main._canvas._ctrl_module_arr.push(ctrl2_module);
            var ctrl3_module = Main._module_creator.CreateByName('control_module', 4, 250, false);
            Main._canvas._module_arr.push(ctrl3_module);
            Main._canvas._ctrl_module_arr.push(ctrl3_module);
            var samplerate_module = Main._module_creator.CreateByName('samplerate_module', 4, 300, false);
            Main._canvas._module_arr.push(samplerate_module);
            Main._canvas._samplerate_module = samplerate_module;
            Main._slider_ctrl1.dispatchEvent(new Event('input'));
            Main._slider_ctrl2.dispatchEvent(new Event('input'));
            Main._slider_ctrl3.dispatchEvent(new Event('input'));
        }
        Main._button_commit.setAttribute('disabled', 'disabled');
        Main._button_revert.setAttribute('disabled', 'disabled');
        Main._wave_file.removeAttribute('disabled');
        Main._canvas.redraw();
        Main._edit = false;
        Main._canvas.calc_module_order();
        Main._recent_backward.click();
    }
    static onMIDIInit(m) {
        var it = m.inputs.values();
        var o = it.next();
        while (o.done == false) {
            document.getElementById('text_midi_in_device').textContent = o.value.name;
            o.value.onmidimessage = Main.onmidimessage;
            o = it.next();
        }
    }
    static onmidimessage(e) {
        Main._text_midi_msg.textContent =
            '0x' + e.data[0].toString(16)
                + ' 0x' + e.data[1].toString(16)
                + ' 0x' + e.data[2].toString(16);
        Main._current_midi_msg = e.data[1];
        var t = e.data[2] / 127.0;
        if (Main._midi_learn1 == Main._current_midi_msg) {
            var min1 = parseFloat(Main._slider_ctrl1.getAttribute('min'));
            var max1 = parseFloat(Main._slider_ctrl1.getAttribute('max'));
            Main._slider_ctrl1.value = (min1 * (1 - t) + max1 * t).toString();
            Main._slider_ctrl1.dispatchEvent(new Event('input'));
        }
        if (Main._midi_learn2 == Main._current_midi_msg) {
            var min2 = parseFloat(Main._slider_ctrl2.getAttribute('min'));
            var max2 = parseFloat(Main._slider_ctrl2.getAttribute('max'));
            Main._slider_ctrl2.value = (min2 * (1 - t) + max2 * t).toString();
            Main._slider_ctrl2.dispatchEvent(new Event('input'));
        }
        if (Main._midi_learn3 == Main._current_midi_msg) {
            var min3 = parseFloat(Main._slider_ctrl3.getAttribute('min'));
            var max3 = parseFloat(Main._slider_ctrl3.getAttribute('max'));
            Main._slider_ctrl3.value = (min3 * (1 - t) + max3 * t).toString();
            Main._slider_ctrl3.dispatchEvent(new Event('input'));
        }
    }
}
Main._display_prompt = false;
Main._moved = false;
Main._edit = false;
Main._midi_learn1 = -1;
Main._midi_learn2 = -1;
Main._midi_learn3 = -1;
window.onload = Main.windowLoaded;
