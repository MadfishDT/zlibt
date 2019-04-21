import { Adler32 as rAdler32, Alder as rAdler} from './adler32';
import { RawDeflate as rRawDeflate} from './rawdeflate';
import { CRC32 as rCRC32 } from './crc32';
import { Heap as rHeap } from './heap';
import { Huffman as rHuffman } from './huffman';
import { Zip ad rZip } from './zip';
export namespace ZlibT {
    export const Adler32 = rAdler32;
    export class Alder extends rAdler {};
    export class RawDeflate extends rRawDeflate {};
    export class CRC32 extends rCRC32 {};
    export class Heap extends rHeap{};
    export const CompressionMethod = {
        DEFLATE: 8,
        RESERVED: 15
    };
    export class Zip extens rZip {};
    export class Huffman extends rHuffman{}; 
}
