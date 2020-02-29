import {AddModule} from "./module/addModule"
import {ControlModule} from "./module/controlModule"
import {CosModule} from "./module/cosModule"
import {DelayModule} from "./module/delayModule"
import {DivideModule} from "./module/divideModule"
import {InputModule} from "./module/inputModule"
import {ModuleBase} from "./module/moduleBase"
import {MultiplyModule} from "./module/multiplyModule"
import {OutputModule} from "./module/outputModule"
import {SampleRateModule} from "./module/sampleRateModule"
import {SinModule} from "./module/sinModule"
import {SqrtModule} from "./module/sqrtModule"
import {SubtractModule} from "./module/subtractModule"
import {TanModule} from "./module/tanModule"
import {MinModule} from "./module/minModule"
import {MaxModule} from "./module/maxModule"

/**
 * TODO.
 * @author fukuroda
 */
class ModuleCreator {
    /**
     * TODO.
     */
    private image_map:Map<string, HTMLImageElement>;

    /**
     * TODO.
     */
    private ctrl_count:number = 0;

    /**
     * TODO.
     */
    public constructor(image_map:Map<string,HTMLImageElement>){
        this.image_map = image_map;
    }

    /**
     *
     * @param name
     * @param x
     * @param y
     * @param img
     * @return
     */
    public CreateByName(name:string, x:number, y:number, removable:boolean=true):ModuleBase|null {
        if ( 'control_module' == name ) {
            this.ctrl_count++;
            return new ControlModule(x, y, this.image_map.get(name + '_' + this.ctrl_count)!, this.ctrl_count);
        }
        else if ( 'input_module' == name ) {
            return new InputModule(x, y, this.image_map.get(name)!);
        }
        else if ( 'output_module' == name ) {
            return new OutputModule(x, y, this.image_map.get(name)!);
        }
        else if ( 'samplerate_module' == name ) {
            return new SampleRateModule(x, y, this.image_map.get(name)!);
        }
        else if ( 'add_module' == name ) {
            return new AddModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ( 'subtract_module' == name) {
            return new SubtractModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ( 'multiply_module' == name) {
            return new MultiplyModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ('divide_module' == name) {
            return new DivideModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ('sqrt_module' == name) {
            return new SqrtModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ('sin_module' == name) {
            return new SinModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ('cos_module' == name) {
            return new CosModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ('tan_module' == name) {
            return new TanModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ( 'delay_module' == name){
            return new DelayModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ('min_module' == name) {
            return new MinModule(x, y, removable, this.image_map.get(name)!);
        }
        else if ( 'max_module' == name){
            return new MaxModule(x, y, removable, this.image_map.get(name)!);
        }
        else{
            return null;
        }
    }
}

export{ModuleCreator}