import {ModuleBase} from "../module/moduleBase"

/**
 * TODO.
 * @author fukuroda
 */
class IoBase{
    /**
     * 値1.
     */
    public value1:number;

    /**
     * 値2:
     */
    public value2:number;

    /**
     * TODO:
     */
    public module:ModuleBase;

    /**
     * TODO:
     */
    public index:number;

    /**
     * constructor.
     * @param module
     * @param index
     */
    public constructor(module:ModuleBase, index:number) {
        this.module = module;
        this.index = index;
        this.value1 = 0.0;
        this.value2 = 0.0;
    }
}

export{IoBase}