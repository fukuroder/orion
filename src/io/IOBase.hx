package io ;
import module.ModuleBase;

/**
 * TODO.
 * @author fukuroda
 */
class IOBase{
    /**
     * 値1.
     */
    public var value1:Float;

    /**
     * 値2:
     */
    public var value2:Float;

    /**
     * TODO:
     */
    public var module:ModuleBase;

    /**
     * TODO:
     */
    public var index:Int;

    /**
     * コンストラクタ.
     * @param module
     * @param index
     */
    public function new(module:ModuleBase, index:Int) {
        this.module = module;
        this.index = index;
        this.value1 = 0.0;
        this.value2 = 0.0;
    }
}
