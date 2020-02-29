import {ModuleBase} from "../module/moduleBase"
import {IoBase} from "./ioBase"
import {Input} from "./input"

/**
 * ...
 * @author fukuroda
 */
class Output extends IoBase{
    /**
     * TODO.
     */
    public next_input_arr:Input[];

    /**
     * TODO.
     */
    public quick_bus_name:string;

    /**
     * TODO.
     */
    public quick_bus_next_input_arr:Input[];

    /**
     * constructor.
     * @param module
     * @param index
     */
    public constructor(module:ModuleBase, index:number){
        super(module, index);
        this.next_input_arr = [];
        this.quick_bus_name = '';           // QuickBus名
        this.quick_bus_next_input_arr = []; // QuickBus接続先
    }

    /**
     * 位置取得.
     */
    public get_point(){
        return this.module.get_output_point(this.index);
    }

    /**
     * 接続
     * @param input
     */
    public connect(input:Input):void{
        input.connect_with_output(this);
        this.next_input_arr.push(input);
    }

    /**
     * 接続
     * @param input
     */
    public connect_quickbus(input:Input):void{
        input.connect_with_output(this);
        this.quick_bus_next_input_arr.push(input);
    }

    /**
     * 切断
     * @param input
     */
    public disconnect(input:Input|null=null):boolean{
        if( input == null ){
            //------------------------
            // 引数無しの場合は全削除
            //------------------------
            for ( var i of this.next_input_arr) { i.disconnect_with_output(); }
            this.next_input_arr.length = 0; // TODO:
            return true;
        }

        var removeIndex:number = this.next_input_arr.indexOf(input);
        if( removeIndex >= 0 ){
            input.disconnect_with_output();
            this.next_input_arr.splice(removeIndex, 1);
            return true;
        }

        return false;
    }

    /**
     * 切断
     * @param input
     */
    public disconnect_quickbus(input:Input|null=null):boolean{
        if( input == null ){
            //------------------------
            // 引数無しの場合は全削除
            //------------------------
            for( var i of this.quick_bus_next_input_arr ){ i.disconnect_with_output(); }
            this.quick_bus_next_input_arr.length = 0; // TODO:
            this.quick_bus_name = "";

            return true;
        }

        var removeIndex = this.quick_bus_next_input_arr.indexOf(input);
        if( removeIndex >= 0 ){
            input.disconnect_with_output();
            this.quick_bus_next_input_arr.splice( removeIndex, 1);

            return true;
        }
        return false;
    }
}

export {Output}
