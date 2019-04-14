import { CompressionMethod } from './zlib';
import { Adler32 } from './adler32';
export class Inflate {

    public input: Uint8Array | Array<number>;
    public ip: number;
    public rawinflate: RawInflate;
    public verify: boolean | undefined;
    public method: CompressionMethod;
    public static BufferType = RawInflate.BufferType;
    constructor(input: Array<number> | Uint8Array, opt_params: any) {

        let cmf: number;
        let flg: number;
        this.input = input;
        this.ip = 0;

        // option parameters
        if (opt_params) {
        if (opt_params['index']) {
            this.ip = opt_params['index'];
        }
        if (opt_params['verify']) {
            this.verify = opt_params['verify'];
        }
        }
    
        // Compression Method and Flags
        cmf = input[this.ip++];
        flg = input[this.ip++];
    
        // compression method
        switch (cmf & 0x0f) {
        case CompressionMethod.DEFLATE:
            this.method = CompressionMethod.DEFLATE;
            break;
        default:
            throw new Error('unsupported compression method');
        }
    
        // fcheck
        if (((cmf << 8) + flg) % 31 !== 0) {
        throw new Error('invalid fcheck flag:' + ((cmf << 8) + flg) % 31);
        }
    
        // fdict (not supported)
        if (flg & 0x20) {
        throw new Error('fdict flag is not supported');
        }
    
        // RawInflate
        this.rawinflate = new RawInflate(input, {
        'index': this.ip,
        'bufferSize': opt_params['bufferSize'],
        'bufferType': opt_params['bufferType'],
        'resize': opt_params['resize']
        });
    }
    public decompress() {
        /** @type {!(Array|Uint8Array)} input buffer. */
        let input = this.input;
        /** @type {!(Uint8Array|Array)} inflated buffer. */
        let buffer;
        /** @type {number} adler-32 checksum */
        let adler32;
      
        buffer = this.rawinflate.decompress();
        this.ip = this.rawinflate.ip;
      
        // verify adler-32
        if (this.verify) {
          adler32 = (
            input[this.ip++] << 24 | input[this.ip++] << 16 |
            input[this.ip++] << 8 | input[this.ip++]
          ) >>> 0;
      
          if (adler32 !== Adler32(buffer)) {
            throw new Error('invalid adler-32 checksum');
          }
        }
      
        return buffer;
      };
      
}
