import { Adler32 as rAdler32, Alder as rAdler} from './adler32';
import { RawDeflate as rRawDeflate} from './rawdeflate';
export namespace ZlibT {
    export const Adler32 = rAdler32;
    export class Alder extends rAdler {};
    export class RawDeflate extends rRawDeflate {};

    export const CompressionMethod = {
        DEFLATE: 8,
        RESERVED: 15
    };
}
