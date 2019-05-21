
import { USE_TYPEDARRAY } from './define/typedarray/hybrid';
import { Huffman } from './huffman';

enum rBufferType {
    BLOCK= 0,
    ADAPTIVE= 1
};
export class RawInflate {
    public static ZLIB_RAW_INFLATE_BUFFER_SIZE = 0x8000;
    public static buildHuffmanTable = Huffman.buildHuffmanTable;
    public static BufferType = rBufferType;

    public static MaxBackwardLength = 32768;
    public static MaxCopyLength = 258;

    public currentLitlenTable: Array<number> | Uint16Array;
    public static Order = (() =>{
        const table = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
        return USE_TYPEDARRAY ? new Uint16Array(table) : table;
    })();

    public static LengthCodeTable = ((table) => {
        return USE_TYPEDARRAY ? new Uint16Array(table) : table;
    })([
        0x0003, 0x0004, 0x0005, 0x0006, 0x0007, 0x0008, 0x0009, 0x000a, 0x000b,
        0x000d, 0x000f, 0x0011, 0x0013, 0x0017, 0x001b, 0x001f, 0x0023, 0x002b,
        0x0033, 0x003b, 0x0043, 0x0053, 0x0063, 0x0073, 0x0083, 0x00a3, 0x00c3,
        0x00e3, 0x0102, 0x0102, 0x0102
    ]);

    public static LengthExtraTable = ((table) => {
        return USE_TYPEDARRAY ? new Uint8Array(table) : table;
    })([
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5,
        5, 5, 0, 0, 0
    ]);

    public static DistCodeTable = ((table) => {
        return USE_TYPEDARRAY ? new Uint16Array(table) : table;
      })([
        0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d, 0x0011,
        0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1, 0x0101, 0x0181,
        0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01, 0x1001, 0x1801, 0x2001,
        0x3001, 0x4001, 0x6001
      ]);

    public static DistExtraTable = (() => {
        const table = [
            0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11,
            11, 12, 12, 13, 13
          ]
        return USE_TYPEDARRAY ? new Uint8Array(table) : table;
    })()

    public static FixedLiteralLengthTable = (() => {
        let lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(288);
        let i, il;
      
        for (i = 0, il = lengths.length; i < il; ++i) {
          lengths[i] =
            (i <= 143) ? 8 :
            (i <= 255) ? 9 :
            (i <= 279) ? 7 :
            8;
        }
        return RawInflate.buildHuffmanTable(lengths)
    })();

    public static FixedDistanceTable = (() => {
        let lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(30);
        let i, il;
      
        for (i = 0, il = lengths.length; i < il; ++i) {
            lengths[i] = 5;
        }
      
        return RawInflate.buildHuffmanTable(lengths)
    })();

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
        this.blocks = [];
        this.bufferSize = RawInflate.ZLIB_RAW_INFLATE_BUFFER_SIZE;
        this.totalpos = 0;
        this.ip = 0;
        this.bitsbuf = 0;
        this.bitsbuflen = 0;
        this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;
        this.bfinal = false;
        this.bufferType = RawInflate.BufferType.ADAPTIVE;
        this.resize = false;
    
    // option parameters
        if (opt_params) {
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
            case RawInflate.BufferType.BLOCK:
            this.op = RawInflate.MaxBackwardLength;
            this.output =
                new (USE_TYPEDARRAY ? Uint8Array : Array)(
                RawInflate.MaxBackwardLength +
                this.bufferSize +
                RawInflate.MaxCopyLength
                );
            break;
            case RawInflate.BufferType.ADAPTIVE:
            this.op = 0;
            this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.bufferSize);
            break;
            default:
            throw new Error('invalid inflate mode');
        }
    }

    public decompress() {
        while (!this.bfinal) {
            this.parseBlock();
        }
        switch (this.bufferType) {
            case RawInflate.BufferType.BLOCK:
                return this.concatBufferBlock();
            case RawInflate.BufferType.ADAPTIVE:
                return this.concatBufferDynamic();
            default:
                throw new Error('invalid inflate mode');
        }
    }
    
    public parseBlock() {
        /** @type {number} header */
        let hdr = this.readBits(3);
      
        // BFINAL
        if (hdr & 0x1) {
            this.bfinal = true;
        }
      
        // BTYPE
        hdr >>>= 1;
        switch (hdr) {
            // uncompressed
            case 0:
                this.parseUncompressedBlock();
                break;
            // fixed huffman
            case 1:
                this.parseFixedHuffmanBlock();
                break;
            // dynamic huffman
            case 2:
                this.parseDynamicHuffmanBlock();
                break;
            // reserved or other
            default:
                throw new Error('unknown BTYPE: ' + hdr);
        }
    }

    public readBits(length: number) {
        let bitsbuf = this.bitsbuf;
        let bitsbuflen = this.bitsbuflen;
        let input = this.input;
        let ip = this.ip;
      
        /** @type {number} */
        let inputLength = input.length;
        /** @type {number} input and output byte. */
        let octet;
      
        // input byte
        if (ip + ((length - bitsbuflen + 7) >> 3) >= inputLength) {
            throw new Error('input buffer is broken');
        }
      
        // not enough buffer
        while (bitsbuflen < length) {
            bitsbuf |= input[ip++] << bitsbuflen;
            bitsbuflen += 8;
        }
      
        // output byte
        octet = bitsbuf & /* MASK */ ((1 << length) - 1);
        bitsbuf >>>= length;
        bitsbuflen -= length;
      
        this.bitsbuf = bitsbuf;
        this.bitsbuflen = bitsbuflen;
        this.ip = ip;
      
        return octet;
    }

    public readCodeByTable(table: Array<number> | Uint16Array | Uint8Array) {
        let bitsbuf = this.bitsbuf;
        let bitsbuflen = this.bitsbuflen;
        let input = this.input;
        let ip = this.ip;
      
        /** @type {number} */
        let inputLength = input.length;
        /** @type {!(Array.<number>|Uint8Array)} huffman code table */
        let codeTable = table[0];
        /** @type {number} */
        let maxCodeLength = table[1];
        /** @type {number} code length & code (16bit, 16bit) */
        let codeWithLength;
        /** @type {number} code bits length */
        let codeLength;
      
        // not enough buffer
        while (bitsbuflen < maxCodeLength) {
            if (ip >= inputLength) {
                break;
            }
            bitsbuf |= input[ip++] << bitsbuflen;
            bitsbuflen += 8;
        }
      
        // read max length
        codeWithLength = codeTable[bitsbuf & ((1 << maxCodeLength) - 1)];
        codeLength = codeWithLength >>> 16;
      
        if (codeLength > bitsbuflen) {
            throw new Error('invalid code length: ' + codeLength);
        }
      
        this.bitsbuf = bitsbuf >> codeLength;
        this.bitsbuflen = bitsbuflen - codeLength;
        this.ip = ip;
      
        return codeWithLength & 0xffff;
      }

      public parseUncompressedBlock() {
        let input = this.input;
        let ip = this.ip;
        let output = this.output;
        let op = this.op;
      
        /** @type {number} */
        let inputLength = input.length;
        /** @type {number} block length */
        let len;
        /** @type {number} number for check block length */
        let nlen;
        /** @type {number} output buffer length */
        let olength = output.length;
        /** @type {number} copy counter */
        let preCopy;
      
        // skip buffered header bits
        this.bitsbuf = 0;
        this.bitsbuflen = 0;
      
        // len
        if (ip + 1 >= inputLength) {
            throw new Error('invalid uncompressed block header: LEN');
        }
        len = input[ip++] | (input[ip++] << 8);
      
        // nlen
        if (ip + 1 >= inputLength) {
            throw new Error('invalid uncompressed block header: NLEN');
        }
        nlen = input[ip++] | (input[ip++] << 8);
      
        // check len & nlen
        if (len === ~nlen) {
            throw new Error('invalid uncompressed block header: length verify');
        }
      
        // check size
        if (ip + len > input.length) { throw new Error('input buffer is broken'); }
      
        // expand buffer
        switch (this.bufferType) {
            case RawInflate.BufferType.BLOCK:
                // pre copy
                while (op + len > output.length) {
                preCopy = olength - op;
                len -= preCopy;
                if (USE_TYPEDARRAY) {
                    (<Uint8Array>output).set((<Uint8Array>input).subarray(ip, ip + preCopy), op);
                    op += preCopy;
                    ip += preCopy;
                } else {
                    while (preCopy--) {
                    output[op++] = input[ip++];
                    }
                }
                this.op = op;
                output = this.expandBufferBlock();
                op = this.op;
                }
                break;
            case RawInflate.BufferType.ADAPTIVE:
                while (op + len > output.length) {
                output = this.expandBufferAdaptive({fixRatio: 2});
                }
                break;
            default:
                throw new Error('invalid inflate mode');
        }
      
        // copy
        if (USE_TYPEDARRAY) {
            (<Uint8Array>output).set((<Uint8Array>input).subarray(ip, ip + len), op);
            op += len;
            ip += len;
        } else {
            while (len--) {
                output[op++] = input[ip++];
            }
        }
      
        this.ip = ip;
        this.op = op;
        this.output = output;
    }

    public parseFixedHuffmanBlock() {
        switch (this.bufferType) {
            case RawInflate.BufferType.ADAPTIVE:
                this.decodeHuffmanAdaptive(
                RawInflate.FixedLiteralLengthTable,
                RawInflate.FixedDistanceTable
                );
                break;
            case RawInflate.BufferType.BLOCK:
                this.decodeHuffmanBlock(
                RawInflate.FixedLiteralLengthTable,
                RawInflate.FixedDistanceTable
                );
                break;
            default:
                throw new Error('invalid inflate mode');
        }
    }

    public parseDynamicHuffmanBlock() {
        /** @type {number} number of literal and length codes. */
        let hlit = this.readBits(5) + 257;
        /** @type {number} number of distance codes. */
        let hdist = this.readBits(5) + 1;
        /** @type {number} number of code lengths. */
        let hclen = this.readBits(4) + 4;
        /** @type {!(Uint8Array|Array.<number>)} code lengths. */
        let codeLengths =
          new (USE_TYPEDARRAY ? Uint8Array : Array)(RawInflate.Order.length);
        /** @type {!Array} code lengths table. */
        let codeLengthsTable;
        /** @type {!(Uint8Array|Array.<number>)} literal and length code table. */
        let litlenTable;
        /** @type {!(Uint8Array|Array.<number>)} distance code table. */
        let distTable;
        /** @type {!(Uint8Array|Array.<number>)} code length table. */
        let lengthTable;
        /** @type {number} */
        let code;
        /** @type {number} */
        let prev;
        /** @type {number} */
        let repeat;
        /** @type {number} loop counter. */
        let i;
        /** @type {number} loop limit. */
        let il;
      
        // decode code lengths
        for (i = 0; i < hclen; ++i) {
            codeLengths[RawInflate.Order[i]] = this.readBits(3);
        }
        if (!USE_TYPEDARRAY) {
            for (i = hclen, hclen = codeLengths.length; i < hclen; ++i) {
                codeLengths[RawInflate.Order[i]] = 0;
            }
        }
      
        // decode length table
        codeLengthsTable = RawInflate.buildHuffmanTable(codeLengths);
        lengthTable = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit + hdist);
        for (i = 0, il = hlit + hdist; i < il;) {
            code = this.readCodeByTable(codeLengthsTable);
            switch (code) {
                case 16:
                    repeat = 3 + this.readBits(2);
                    while (repeat--) { lengthTable[i++] = prev; }
                break;
                case 17:
                    repeat = 3 + this.readBits(3);
                    while (repeat--) { lengthTable[i++] = 0; }
                    prev = 0;
                break;
                case 18:
                    repeat = 11 + this.readBits(7);
                    while (repeat--) { lengthTable[i++] = 0; }
                    prev = 0;
                break;
                default:
                    lengthTable[i++] = code;
                    prev = code;
                break;
            }
        }
      
        litlenTable = USE_TYPEDARRAY
          ? RawInflate.buildHuffmanTable(lengthTable.subarray(0, hlit))
          : RawInflate.buildHuffmanTable(lengthTable.slice(0, hlit));
        distTable = USE_TYPEDARRAY
          ? RawInflate.buildHuffmanTable(lengthTable.subarray(hlit))
          : RawInflate.buildHuffmanTable(lengthTable.slice(hlit));
      
        switch (this.bufferType) {
            case RawInflate.BufferType.ADAPTIVE:
                this.decodeHuffmanAdaptive(litlenTable, distTable);
                break;
            case RawInflate.BufferType.BLOCK:
                this.decodeHuffmanBlock(litlenTable, distTable);
                break;
            default:
                throw new Error('invalid inflate mode');
        }
    }

    public decodeHuffmanBlock(litlen: Array<number>|Uint16Array, dist: Array<number>|Uint8Array) {
        let output = this.output;
        let op = this.op;
        
        this.currentLitlenTable = litlen;
        
        let olength = output.length - RawInflate.MaxCopyLength;
        let code;
        let ti;
        let codeDist;
        let codeLength;
        
        let lengthCodeTable = RawInflate.LengthCodeTable;
        let lengthExtraTable = RawInflate.LengthExtraTable;
        let distCodeTable = RawInflate.DistCodeTable;
        let distExtraTable = RawInflate.DistExtraTable;
        
        code = this.readCodeByTable(litlen);
        while ( code !== 256) {
            // literal
            if (code < 256) {
            if (op >= olength) {
                this.op = op;
                output = this.expandBufferBlock();
                op = this.op;
            }
                output[op++] = code;
                continue;
            }
        
            // length code
            ti = code - 257;
            codeLength = lengthCodeTable[ti];
            if (lengthExtraTable[ti] > 0) {
                codeLength += this.readBits(lengthExtraTable[ti]);
            }
        
            // dist code
            code = this.readCodeByTable(dist);
            codeDist = distCodeTable[code];
            if (distExtraTable[code] > 0) {
                codeDist += this.readBits(distExtraTable[code]);
            }
        
            // lz77 decode
            if (op >= olength) {
                this.op = op;
                output = this.expandBufferBlock();
                op = this.op;
            }
            while (codeLength--) {
                output[op] = output[(op++) - codeDist];
            }
            code = this.readCodeByTable(litlen);
        }
        
        while (this.bitsbuflen >= 8) {
            this.bitsbuflen -= 8;
            this.ip--;
        }
        this.op = op;
    }

    public decodeHuffmanAdaptive(litlen: Array<number>|Uint16Array, dist: Array<number>|Uint8Array) {
        let output = this.output;
        let op = this.op;
      
        this.currentLitlenTable = litlen;
      
        let olength = output.length;
        let code;
        let ti;
        let codeDist;
        let codeLength;
      
        let lengthCodeTable = RawInflate.LengthCodeTable;
        let lengthExtraTable = RawInflate.LengthExtraTable;
        let distCodeTable = RawInflate.DistCodeTable;
        let distExtraTable = RawInflate.DistExtraTable;
    
        while ( (code = this.readCodeByTable(litlen)) !== 256 ) {
          // literal
            if (code < 256) {
                if (op >= olength) {
                output = this.expandBufferAdaptive();
                olength = output.length;
                }
                output[op++] = code;
                continue;
            }
      
          // length code
            ti = code - 257;
            codeLength = lengthCodeTable[ti];
            if (lengthExtraTable[ti] > 0) {
                codeLength += this.readBits(lengthExtraTable[ti]);
            }
      
          // dist code
            code = this.readCodeByTable(dist);
            codeDist = distCodeTable[code];
            if (distExtraTable[code] > 0) {
                codeDist += this.readBits(distExtraTable[code]);
            }
      
          // lz77 decode
            if (op + codeLength > olength) {
                output = this.expandBufferAdaptive();
                olength = output.length;
            }
            while (codeLength--) {
                output[op] = output[(op++) - codeDist];
            }
            code = this.readCodeByTable(litlen);
        }
      
        while (this.bitsbuflen >= 8) {
            this.bitsbuflen -= 8;
            this.ip--;
        }
        this.op = op;
    }

    public expandBufferBlock() {
        let buffer =
            new (USE_TYPEDARRAY ? Uint8Array : Array)(
              this.op - RawInflate.MaxBackwardLength
            );
        let backward = this.op - RawInflate.MaxBackwardLength;
        let i;
        let il;
      
        let output = this.output;
      
        // copy to output buffer
        if (USE_TYPEDARRAY) {
          (<Uint8Array>buffer).set((<Uint8Array>output).subarray(RawInflate.MaxBackwardLength, buffer.length));
        } else {
          for (i = 0, il = buffer.length; i < il; ++i) {
            buffer[i] = output[i + RawInflate.MaxBackwardLength];
          }
        }
      
        this.blocks.push(buffer);
        this.totalpos += buffer.length;
      
        // copy to backward buffer
        if (USE_TYPEDARRAY) {
            (<Uint8Array>output).set(
                (<Uint8Array>output).subarray(backward, backward + RawInflate.MaxBackwardLength)
            );
        } else {
            for (i = 0; i < RawInflate.MaxBackwardLength; ++i) {
                output[i] = output[backward + i];
            }
        }
      
        this.op = RawInflate.MaxBackwardLength;
      
        return output;
    }

    public expandBufferAdaptive(opt_param?: any) {
        let buffer;
        let ratio = (this.input.length / this.ip + 1) | 0;
        let maxHuffCode;
        let newSize;
        let maxInflateSize;
      
        let input = this.input;
        let output = this.output;
      
        if (opt_param) {
            if (typeof opt_param.fixRatio === 'number') {
                ratio = opt_param.fixRatio;
            }
            if (typeof opt_param.addRatio === 'number') {
                ratio += opt_param.addRatio;
            }
        }
      
        // calculate new buffer size
        if (ratio < 2) {
            maxHuffCode =
                (input.length - this.ip) / this.currentLitlenTable[2];
            maxInflateSize = (maxHuffCode / 2 * 258) | 0;
            newSize = maxInflateSize < output.length ?
                output.length + maxInflateSize :
                output.length << 1;
        } else {
            newSize = output.length * ratio;
        }
      
        // buffer expantion
        if (USE_TYPEDARRAY) {
            buffer = new Uint8Array(newSize);
            buffer.set(output);
        } else {
            buffer = output;
        }
      
        this.output = buffer;
      
        return this.output;
    }

    public concatBufferBlock() {
        /** @type {number} buffer pointer. */
        let pos = 0;
        /** @type {number} buffer pointer. */
        let limit = this.totalpos + (this.op - RawInflate.MaxBackwardLength);
        /** @type {!(Array.<number>|Uint8Array)} output block array. */
        let output = this.output;
        /** @type {!Array} blocks array. */
        let blocks = this.blocks;
        /** @type {!(Array.<number>|Uint8Array)} output block array. */
        let block;
        /** @type {!(Array.<number>|Uint8Array)} output buffer. */
        let buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(limit);
        /** @type {number} loop counter. */
        let i;
        /** @type {number} loop limiter. */
        let il;
        /** @type {number} loop counter. */
        let j;
        /** @type {number} loop limiter. */
        let jl;
      
        // single buffer
        if (blocks.length === 0) {
            return USE_TYPEDARRAY ?
                (<Uint8Array>this.output).subarray(RawInflate.MaxBackwardLength, this.op) :
                this.output.slice(RawInflate.MaxBackwardLength, this.op);
        }
      
        // copy to buffer
        for (i = 0, il = blocks.length; i < il; ++i) {
            block = blocks[i];
            for (j = 0, jl = block.length; j < jl; ++j) {
                buffer[pos++] = block[j];
            }
        }
      
        // current buffer
        for (i = RawInflate.MaxBackwardLength, il = this.op; i < il; ++i) {
            buffer[pos++] = output[i];
        }
      
        this.blocks = [];
        this.buffer = buffer;
      
        return this.buffer;
    }

    public concatBufferDynamic() {
        let buffer;
        let op = this.op;
      
        if (USE_TYPEDARRAY) {
            if (this.resize) {
                buffer = new Uint8Array(op);
                buffer.set((<Uint8Array>this.output).subarray(0, op));
            } else {
                buffer = (<Uint8Array>this.output).subarray(0, op);
            }
        } else {
            if (this.output.length > op) {
                this.output = this.output.slice(0,op-1);
            }
            buffer = this.output;
        }
      
        this.buffer = buffer;
      
        return this.buffer;
    }
}
