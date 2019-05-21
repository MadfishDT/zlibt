import { CompressionMethod } from './define/compress';
import { USE_TYPEDARRAY } from './define/typedarray/hybrid';
import { RawInflateStream } from './rawinflate_stream';

export class InflateStream {

    public input: Array<number> | Uint8Array;
    public output: Array<number> | Uint8Array;
    public ip: number;
    public rawinflate: RawInflateStream;
    public method: CompressionMethod;;

    constructor(input: Array<number> | Uint8Array) {
        this.input = input === void 0 ? new (USE_TYPEDARRAY ? Uint8Array : Array)(null) : input;
        this.ip = 0;
        this.rawinflate = new RawInflateStream(this.input, this.ip);
        this.output = this.rawinflate.output;
    }

    public decompress(input: Uint8Array | Array<number>) {
        let buffer;
        if (input !== void 0) {
            if (USE_TYPEDARRAY) {
                let tmp = new Uint8Array(this.input.length + input.length);
                tmp.set(this.input, 0);
                tmp.set(input, this.input.length);
                this.input = tmp;
            } else {
                this.input = (<Array<number>>(this.input)).concat(<Array<number>>input);
            }
        }
    
        if (this.method === void 0) {
            if(this.readHeader() < 0) {
                return new (USE_TYPEDARRAY ? Uint8Array : Array)(null);
            }
        }
    
        buffer = this.rawinflate.decompress(this.input, this.ip);
        if (this.rawinflate.ip !== 0) {
            this.input = USE_TYPEDARRAY ?
                (<Uint8Array>this.input).subarray(this.rawinflate.ip) :
                this.input.slice(this.rawinflate.ip);
            this.ip = 0;
        }
        return buffer;
    }

    public readHeader() {
        let ip = this.ip;
        let input = this.input;
    
        // Compression Method and Flags
        let cmf = input[ip++];
        let flg = input[ip++];
    
        if (cmf === void 0 || flg === void 0) {
        return -1;
        }
    
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
    
        this.ip = ip;
    }
}
