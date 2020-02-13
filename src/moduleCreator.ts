package ;
import js.html.Image;
import module.AddModule;
import module.ControlModule;
import module.CosModule;
import module.DelayModule;
import module.DivideModule;
import module.InputModule;
import module.ModuleBase;
import module.MultiplyModule;
import module.OutputModule;
import module.SampleRateModule;
import module.SinModule;
import module.SqrtModule;
import module.SubtractModule;
import module.TanModule;
import module.MinModule;
import module.MaxModule;

/**
 * TODO.
 * @author fukuroda
 */
class ModuleCreator {
    /**
     * TODO.
     */
    var image_map:Map<String,Image>;

    /**
     * TODO.
     */
    var ctrl_count:Int = 0;

    /**
     * TODO.
     */
    public function new(image_map:Map<String,Image>){
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
    public function CreateByName(name:String, x:Int, y:Int, removable:Bool=true):ModuleBase {
        if ( 'control_module' == name ) {
            ctrl_count++;
            return new ControlModule(x, y, image_map[name + '_' + ctrl_count], ctrl_count);
        }
        else if ( 'input_module' == name ) {
            return new InputModule(x, y, image_map[name]);
        }
        else if ( 'output_module' == name ) {
            return new OutputModule(x, y, image_map[name]);
        }
        else if ( 'samplerate_module' == name ) {
            return new SampleRateModule(x, y, image_map[name]);
        }
        else if ( 'add_module' == name ) {
            return new AddModule(x, y, removable, image_map[name]);
        }
        else if ( 'subtract_module' == name) {
            return new SubtractModule(x, y, removable, image_map[name]);
        }
        else if ( 'multiply_module' == name) {
            return new MultiplyModule(x, y, removable, image_map[name]);
        }
        else if ('divide_module' == name) {
            return new DivideModule(x, y, removable, image_map[name]);
        }
        else if ('sqrt_module' == name) {
            return new SqrtModule(x, y, removable, image_map[name]);
        }
        else if ('sin_module' == name) {
            return new SinModule(x, y, removable, image_map[name]);
        }
        else if ('cos_module' == name) {
            return new CosModule(x, y, removable, image_map[name]);
        }
        else if ('tan_module' == name) {
            return new TanModule(x, y, removable, image_map[name]);
        }
        else if ( 'delay_module' == name){
            return new DelayModule(x, y, removable, image_map[name]);
        }
        else if ('min_module' == name) {
            return new MinModule(x, y, removable, image_map[name]);
        }
        else if ( 'max_module' == name){
            return new MaxModule(x, y, removable, image_map[name]);
        }
        else{
            return null;
        }
    }
}
