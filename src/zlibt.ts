
export class ZlibT {
    public static LogTest(msg: string) {
        console.log(msg);
    }
}
export { Adler32 , Alder} from './adler32';

export { CRC32 } from './crc32';
export { Heap } from './heap';
export { Huffman } from './huffman';

// PKZIP
export { Zip } from './zip';
export { Unzip } from './unzip';

// RAW
export { RawInflate } from './rawinflate';
export { RawInflateStream } from './rawinflate_stream';
export { RawDeflate, CompressionType } from './rawdeflate';

// Zlib
export { InflateStream } from './inflate_stream';
export { Inflate } from './inflate';
export { Deflate } from './deflate';

export { CompressionMethod } from './define/compress';
