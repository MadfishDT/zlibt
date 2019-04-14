import { USE_TYPEDARRAY } from './define/typedarray/hybrid';

export class RawDeflate {
    public static CompressionType = {
        NONE: 0,
        FIXED: 1,
        DYNAMIC: 2,
        RESERVED: 3
      }; 
    public static WindowSize = 0x8000;
    constructor(input: Array<number> | Uint8Array, opt_params: any) {
    }
}