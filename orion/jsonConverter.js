class JsonConverter {
    static getSaveObject(module_arr, ctrl_arr) {
        var module_arr2 = module_arr.slice();
        module_arr2.sort((m1, m2) => {
            if (m1.name != "control_module" && m2.name != "control_module") {
                return 0;
            }
            if (m1.name != "control_module") {
                return 1;
            }
            if (m2.name != "control_module") {
                return -1;
            }
            var ctrl1 = m1;
            var ctrl2 = m2;
            return ctrl1.idx - ctrl2.idx;
        });
        var module_json = module_arr2.map((module) => {
            var outputs = module.output_arr.map((output) => {
                var next_inputs = output.next_input_arr.map((next_input) => {
                    var next_module_idx = module_arr2.indexOf(next_input.module);
                    return { next_module_index: next_module_idx, next_input_index: next_input.index };
                });
                var quick_bus_next_inputs = output.quick_bus_next_input_arr.map((next_input) => {
                    var next_module_idx = module_arr2.indexOf(next_input.module);
                    return { next_module_index: next_module_idx, next_input_index: next_input.index };
                });
                return { next_inputs: next_inputs,
                    quick_bus_name: output.quick_bus_name,
                    quick_bus_next_inputs: quick_bus_next_inputs };
            });
            var inputs = module.input_arr.map((input) => {
                return { quick_const: input.quick_const };
            });
            return { module_name: module.name,
                module_x: module.x,
                module_y: module.y - 50,
                outputs: outputs,
                inputs: inputs };
        });
        var ctrl_json = ctrl_arr.map((ctrl) => {
            return { min: ctrl.getAttribute('min'),
                max: ctrl.getAttribute('max'),
                step: ctrl.getAttribute('step'),
                value: ctrl.value };
        });
        return { module_info: module_json, control_info: ctrl_json };
    }
    static aaa(module_creator, loaded_data) {
        var module_arr = [];
        var module_info = loaded_data.module_info;
        for (var m of module_info) {
            var newmodule = module_creator.CreateByName(m.module_name, m.module_x, m.module_y + 50);
            module_arr.push(newmodule);
        }
        for (var module_index = 0; module_index < loaded_data.module_info.length; module_index++) {
            var m = loaded_data.module_info[module_index];
            for (var input_index = 0; input_index < m.inputs.length; input_index++) {
                var input = m.inputs[input_index];
                if (input.quick_const != '') {
                    module_arr[module_index].input_arr[input_index].quick_const = input.quick_const;
                    module_arr[module_index].input_arr[input_index].value1 = parseFloat(input.quick_const);
                    module_arr[module_index].input_arr[input_index].value2 = parseFloat(input.quick_const);
                    module_arr[module_index].input_arr[input_index].module.constant_update(true);
                }
            }
            for (var output_index = 0; output_index < m.outputs.length; output_index++) {
                var output = m.outputs[output_index];
                var next_inputs = output.next_inputs;
                for (var next of next_inputs) {
                    var next_input = module_arr[next.next_module_index].input_arr[next.next_input_index];
                    module_arr[module_index].output_arr[output_index].connect(next_input);
                }
                var quick_bus_next_inputs = output.quick_bus_next_inputs;
                for (var next of quick_bus_next_inputs) {
                    var next_input = module_arr[next.next_module_index].input_arr[next.next_input_index];
                    module_arr[module_index].output_arr[output_index].quick_bus_name = output.quick_bus_name;
                    module_arr[module_index].output_arr[output_index].connect_quickbus(next_input);
                }
            }
        }
        return module_arr;
    }
}
export { JsonConverter };
