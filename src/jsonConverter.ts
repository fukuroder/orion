import {Input} from "./io/input.js"
import {ControlModule} from "./module/controlModule.js"
import {ModuleBase} from "./module/moduleBase.js"
import {ModuleCreator} from "./moduleCreator.js"

/**
 * TODO.
 * @author fukuroda
 */
class JsonConverter{

    /**
     * 全モジュールの配置情報(TODO:移動)
     * @param module_arr
     * @param ctrl_arr
     */
    public static getSaveObject(module_arr:ModuleBase[], ctrl_arr:HTMLInputElement[]) {

        // TODO:ControlModuleの順版がスライダーと合っていないためソート（暫定）
        var module_arr2:ModuleBase[] = module_arr.slice();
        module_arr2.sort( (m1:ModuleBase, m2:ModuleBase)=>{
            if (m1.name != "control_module" && m2.name != "control_module" ) {
                return 0;
            }
            if ( m1.name != "control_module" ) {
                return 1;
            }
            if ( m2.name != "control_module" ) {
                return -1;
            }

            var ctrl1 = m1 as ControlModule;
            var ctrl2 = m2 as ControlModule;
            return ctrl1.idx - ctrl2.idx;
        });

        var module_json = module_arr2.map((module)=>{

            //----------------
            // output情報作成
            //----------------
            var outputs = module.output_arr.map((output)=>{

                //--------------------
                // next input情報作成
                //--------------------
                var next_inputs = output.next_input_arr.map((next_input)=>{
                    // next input moduleのインデックス取得
                    var next_module_idx = module_arr2.indexOf(next_input.module);

                    // next input情報１つ分作成
                    return {next_module_index:next_module_idx, next_input_index:next_input.index};
                });

                var quick_bus_next_inputs = output.quick_bus_next_input_arr.map((next_input)=>{
                    // next input moduleのインデックス取得
                    var next_module_idx = module_arr2.indexOf(next_input.module);

                    // next input情報１つ分作成
                    return {next_module_index:next_module_idx, next_input_index:next_input.index};
                });

                // output情報１つ分作成
                return{ next_inputs:next_inputs,
                        quick_bus_name:output.quick_bus_name,
                        quick_bus_next_inputs:quick_bus_next_inputs };
            });

            // QuickConst
            var inputs = module.input_arr.map((input)=>{
                return {quick_const:input.quick_const};
            });

            //----------------
            // module情報作成
            //----------------
            return{module_name:module.name,
                   module_x:module.x,
                   module_y:module.y-50,
                   outputs:outputs,
                   inputs:inputs};
        });

        var ctrl_json = ctrl_arr.map((ctrl)=>{
            return{min:ctrl.getAttribute('min'),
                   max:ctrl.getAttribute('max'),
                   step:ctrl.getAttribute('step'),
                   value:ctrl.value}
        });

        return{module_info:module_json, control_info:ctrl_json};
    }

    /**
     * TODO.
     * @param module_creator
     * @param loaded_data
     */
    public static aaa(module_creator:ModuleCreator, loaded_data:any) {
        //----------------
        // モジュール配置
        //----------------

        var module_arr:ModuleBase[] = [];
        var module_info:any[] = loaded_data.module_info;

        for ( var m of module_info ) {
            var newmodule:ModuleBase = module_creator.CreateByName( m.module_name, m.module_x, m.module_y+50 )!;
            module_arr.push(newmodule);
        }

        //------
        // 配線
        //------
        for( var module_index=0; module_index<loaded_data.module_info.length; module_index++ ){
            var m = loaded_data.module_info[module_index];

            for( var input_index=0; input_index<m.inputs.length; input_index++ ){
                var input = m.inputs[input_index];

                // QuickConst
                if( input.quick_const != '' ){
                    module_arr[module_index].input_arr[input_index].quick_const = input.quick_const;

                    // TODO
                    module_arr[module_index].input_arr[input_index].value1 = parseFloat(input.quick_const);
                    module_arr[module_index].input_arr[input_index].value2 = parseFloat(input.quick_const);
                    module_arr[module_index].input_arr[input_index].module.constant_update(true);
                }
            }

            for ( var output_index=0; output_index<m.outputs.length; output_index++ ) {
                var output = m.outputs[output_index];

                // next input
                var next_inputs:any[] = output.next_inputs;
                for ( var next of next_inputs ){
                    var next_input:Input = module_arr[next.next_module_index].input_arr[next.next_input_index];
                    module_arr[module_index].output_arr[output_index].connect(next_input);
                }

                // next input(QuickBus)
                var quick_bus_next_inputs:any[] = output.quick_bus_next_inputs;
                for ( var next of quick_bus_next_inputs) {
                    var next_input:Input = module_arr[next.next_module_index].input_arr[next.next_input_index];
                    module_arr[module_index].output_arr[output_index].quick_bus_name = output.quick_bus_name;
                    module_arr[module_index].output_arr[output_index].connect_quickbus(next_input);
                }
            }
        }

        return module_arr;
    }

}

export{JsonConverter}