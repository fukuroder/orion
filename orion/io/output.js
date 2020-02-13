import { IoBase } from "./ioBase.js";
class Output extends IoBase {
    constructor(module, index) {
        super(module, index);
        this.next_input_arr = [];
        this.quick_bus_name = '';
        this.quick_bus_next_input_arr = [];
    }
    get_point() {
        return this.module.get_output_point(this.index);
    }
    connect(input) {
        input.connect_with_output(this);
        this.next_input_arr.push(input);
    }
    connect_quickbus(input) {
        input.connect_with_output(this);
        this.quick_bus_next_input_arr.push(input);
    }
    disconnect(input = null) {
        if (input == null) {
            for (var i of this.next_input_arr) {
                i.disconnect_with_output();
            }
            this.next_input_arr.length = 0;
            return true;
        }
        var removeIndex = this.next_input_arr.indexOf(input);
        if (removeIndex >= 0) {
            input.disconnect_with_output();
            this.next_input_arr.splice(removeIndex, 1);
            return true;
        }
        return false;
    }
    disconnect_quickbus(input = null) {
        if (input == null) {
            for (var i of this.quick_bus_next_input_arr) {
                i.disconnect_with_output();
            }
            this.quick_bus_next_input_arr.length = 0;
            this.quick_bus_name = "";
            return true;
        }
        var removeIndex = this.quick_bus_next_input_arr.indexOf(input);
        if (removeIndex >= 0) {
            input.disconnect_with_output();
            this.quick_bus_next_input_arr.splice(removeIndex, 1);
            return true;
        }
        return false;
    }
}
export { Output };
