
import { USE_TYPEDARRAY } from './define/typedarray/hybrid';
import { ZlibT } from './zlibt'; 
/**
 * @constructor
 * @param {!(Uint8Array|Array.<number>)} input input buffer.
 * @param {Object} opt_params option parameter.
 *
 * opt_params は以下のプロパティを指定する事ができます。
 *   - index: input buffer の deflate コンテナの開始位置.
 *   - blockSize: バッファのブロックサイズ.
 *   - bufferType: Zlib.RawInflate.BufferType の値によってバッファの管理方法を指定する.
 *   - resize: 確保したバッファが実際の大きさより大きかった場合に切り詰める.
 */
enum rBufferType {
    BLOCK= 0,
    ADAPTIVE= 1
};
class RawInflate{
    public static ZLIB_RAW_INFLATE_BUFFER_SIZE = 0x8000; 
    public static buildHuffmanTable = ZlibT.Huffman.buildHuffmanTable;
    public static BufferType = rBufferType;

    public buffer: Array<number>|Uint8Array;
    public blocks: Array<(Array<number>|Uint8Array)>;
    public bufferSize: number;
    public totalpos: number;
    public ip;
    public bitsbuf;
    public bitsbuflen;
    public input: Array<number>|Uint8Array;
    public output: Array<number>|Uint8Array;
    /** @type {!number} output buffer pointer. */
    public op: number;
    /** @type {boolean} is final block flag. */
    public bfinal = false;
    /** @type {Zlib.RawInflate.BufferType} buffer management. */
    public bufferType = RawInflate.BufferType.ADAPTIVE;
    /** @type {boolean} resize flag for memory size optimization. */
    public resize = false;
    constructor(input: Uint8Array | Array<number>, opt_params: any) {
        /** @type {!(Array.<number>|Uint8Array)} inflated buffer */
        this.buffer;
        /** @type {!Array.<(Array.<number>|Uint8Array)>} */
        this.blocks = [];
        /** @type {number} block size. */
        this.bufferSize = RawInflate.ZLIB_RAW_INFLATE_BUFFER_SIZE;
        /** @type {!number} total output buffer pointer. */
        this.totalpos = 0;
        /** @type {!number} input buffer pointer. */
        this.ip = 0;
        /** @type {!number} bit stream reader buffer. */
        this.bitsbuf = 0;
        /** @type {!number} bit stream reader buffer size. */
        this.bitsbuflen = 0;
        /** @type {!(Array.<number>|Uint8Array)} input buffer. */
        this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;
        /** @type {!(Uint8Array|Array.<number>)} output buffer. */
        this.output;
        /** @type {!number} output buffer pointer. */
        this.op;
        /** @type {boolean} is final block flag. */
        this.bfinal = false;
        /** @type {Zlib.RawInflate.BufferType} buffer management. */
        this.bufferType = Zlib.RawInflate.BufferType.ADAPTIVE;
        /** @type {boolean} resize flag for memory size optimization. */
        this.resize = false;
    
    // option parameters
        if (opt_params || !(opt_params = {})) {
            if (opt_params['index']) {
            this.ip = opt_params['index'];
            }
            if (opt_params['bufferSize']) {
            this.bufferSize = opt_params['bufferSize'];
            }
            if (opt_params['bufferType']) {
            this.bufferType = opt_params['bufferType'];
            }
            if (opt_params['resize']) {
            this.resize = opt_params['resize'];
            }
        }
    
    // initialize
        switch (this.bufferType) {
            case Zlib.RawInflate.BufferType.BLOCK:
            this.op = Zlib.RawInflate.MaxBackwardLength;
            this.output =
                new (USE_TYPEDARRAY ? Uint8Array : Array)(
                Zlib.RawInflate.MaxBackwardLength +
                this.bufferSize +
                Zlib.RawInflate.MaxCopyLength
                );
            break;
            case Zlib.RawInflate.BufferType.ADAPTIVE:
            this.op = 0;
            this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.bufferSize);
            break;
            default:
            throw new Error('invalid inflate mode');
        }
    }
}
