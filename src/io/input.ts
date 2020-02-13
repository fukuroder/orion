import {ModuleBase} from "../module/moduleBase.js"
import {IoBase} from "./ioBase.js"
import {Output} from "./output.js"

/**
 * Inputクラス.
 * @author fukuroda
 */
class Input extends IoBase {
    /**
     * 前のOutput.
     */
    public prev_output:Output|null;

    /**
     * QuickConst名.
     */
    public quick_const:string;

    /**
     * 定数か？.
     */
    public constant:boolean;

    /**
     * TODO.
     */
    public stream_updated:boolean;

    /**
     * constructor.
     * @param module
     * @param index
     */
    public constructor(module:ModuleBase, index:number){
        super(module, index);

        this.prev_output = null;
        this.constant = true;
        this.quick_const = '';
        this.stream_updated = false;
    }

    /**
     * 位置取得.
     */
    public get_point(){
        return this.module.get_input_point(this.index);
    }

    /**
     * 接続.
     * @param output
     */
    public connect_with_output(output:Output):void{
        this.prev_output = output;
        this.value1 = output.value1;
        this.value2 = output.value2;
        this.constant = output.module.is_constant();
        this.module.constant_update(true);
    }

    /**
     * QuickConst更新.
     * @param quick_const
     * @param value
     */
    public update_quick_const(quick_const:string, value:number):void{
        this.quick_const = quick_const;
        this.value1 = value;
        this.value2 = value;
        this.module.constant_update(true);
    }

    /**
     * 切断.
     */
    public disconnect_with_output():void{
        this.prev_output = null;
        this.value1 = 0.0;
        this.value2 = 0.0;
        this.constant = true;
        this.module.constant_update(true);
    }
}

export {Input}
