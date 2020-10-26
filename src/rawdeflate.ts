import { USE_TYPEDARRAY } from './define/typedarray/hybrid';
import { BitStream } from './bitstream';
import { Heap } from './heap';

export enum CompressionType {
    NONE = 0,
    FIXED = 1,
    DYNAMIC = 2,
    RESERVED = 3
};

export class Lz77Match {
    public length: number;
    public backwardDistance: number;

    constructor(length: number, backwardDistance: number) {
        this.length = length;
        this.backwardDistance = backwardDistance;
    }

    static get LengthCodeTable() {
        const code = (length: number) => {
            switch (true) {
                case (length === 3): return [257, length - 3, 0]; break;
                case (length === 4): return [258, length - 4, 0]; break;
                case (length === 5): return [259, length - 5, 0]; break;
                case (length === 6): return [260, length - 6, 0]; break;
                case (length === 7): return [261, length - 7, 0]; break;
                case (length === 8): return [262, length - 8, 0]; break;
                case (length === 9): return [263, length - 9, 0]; break;
                case (length === 10): return [264, length - 10, 0]; break;
                case (length <= 12): return [265, length - 11, 1]; break;
                case (length <= 14): return [266, length - 13, 1]; break;
                case (length <= 16): return [267, length - 15, 1]; break;
                case (length <= 18): return [268, length - 17, 1]; break;
                case (length <= 22): return [269, length - 19, 2]; break;
                case (length <= 26): return [270, length - 23, 2]; break;
                case (length <= 30): return [271, length - 27, 2]; break;
                case (length <= 34): return [272, length - 31, 2]; break;
                case (length <= 42): return [273, length - 35, 3]; break;
                case (length <= 50): return [274, length - 43, 3]; break;
                case (length <= 58): return [275, length - 51, 3]; break;
                case (length <= 66): return [276, length - 59, 3]; break;
                case (length <= 82): return [277, length - 67, 4]; break;
                case (length <= 98): return [278, length - 83, 4]; break;
                case (length <= 114): return [279, length - 99, 4]; break;
                case (length <= 130): return [280, length - 115, 4]; break;
                case (length <= 162): return [281, length - 131, 5]; break;
                case (length <= 194): return [282, length - 163, 5]; break;
                case (length <= 226): return [283, length - 195, 5]; break;
                case (length <= 257): return [284, length - 227, 5]; break;
                case (length === 258): return [285, length - 258, 0]; break;
                default: throw 'invalid length: ' + length;
            }
        }

        let table = [];
        let i = 0;
        let c = [];

        for (i = 3; i <= 258; i++) {
            c = code(i);
            table[i] = (c[2] << 24) | (c[1] << 16) | c[0];
        }

        return USE_TYPEDARRAY ? new Uint32Array(table) : table;
    }
    public getDistanceCode_(dist: number) {
        /** @type {!Array.<number>} distance code table. */
        let r;
        switch (true) {
            case (dist === 1): r = [0, dist - 1, 0]; break;
            case (dist === 2): r = [1, dist - 2, 0]; break;
            case (dist === 3): r = [2, dist - 3, 0]; break;
            case (dist === 4): r = [3, dist - 4, 0]; break;
            case (dist <= 6): r = [4, dist - 5, 1]; break;
            case (dist <= 8): r = [5, dist - 7, 1]; break;
            case (dist <= 12): r = [6, dist - 9, 2]; break;
            case (dist <= 16): r = [7, dist - 13, 2]; break;
            case (dist <= 24): r = [8, dist - 17, 3]; break;
            case (dist <= 32): r = [9, dist - 25, 3]; break;
            case (dist <= 48): r = [10, dist - 33, 4]; break;
            case (dist <= 64): r = [11, dist - 49, 4]; break;
            case (dist <= 96): r = [12, dist - 65, 5]; break;
            case (dist <= 128): r = [13, dist - 97, 5]; break;
            case (dist <= 192): r = [14, dist - 129, 6]; break;
            case (dist <= 256): r = [15, dist - 193, 6]; break;
            case (dist <= 384): r = [16, dist - 257, 7]; break;
            case (dist <= 512): r = [17, dist - 385, 7]; break;
            case (dist <= 768): r = [18, dist - 513, 8]; break;
            case (dist <= 1024): r = [19, dist - 769, 8]; break;
            case (dist <= 1536): r = [20, dist - 1025, 9]; break;
            case (dist <= 2048): r = [21, dist - 1537, 9]; break;
            case (dist <= 3072): r = [22, dist - 2049, 10]; break;
            case (dist <= 4096): r = [23, dist - 3073, 10]; break;
            case (dist <= 6144): r = [24, dist - 4097, 11]; break;
            case (dist <= 8192): r = [25, dist - 6145, 11]; break;
            case (dist <= 12288): r = [26, dist - 8193, 12]; break;
            case (dist <= 16384): r = [27, dist - 12289, 12]; break;
            case (dist <= 24576): r = [28, dist - 16385, 13]; break;
            case (dist <= 32768): r = [29, dist - 24577, 13]; break;
            default: throw 'invalid distance';
        }
        return r;
    }

    public toLz77Array() {

        let length = this.length;
        let dist = this.backwardDistance;
        let codeArray = [];
        let pos = 0;
        let code;

        // length
        code = Lz77Match.LengthCodeTable[length];
        codeArray[pos++] = code & 0xffff;
        codeArray[pos++] = (code >> 16) & 0xff;
        codeArray[pos++] = code >> 24;

        // distance
        code = this.getDistanceCode_(dist);
        codeArray[pos++] = code[0];
        codeArray[pos++] = code[1];
        codeArray[pos++] = code[2];

        return codeArray;
    }
}

export class RawDeflate {
    //public static CompressionType = gCompressionType; 
    public compressionType: CompressionType;
    public lazy: number;
    public freqsLitLen: Array<any> | Uint32Array;
    public freqsDist: Array<any> | Uint32Array;
    public input: Array<number> | Uint8Array;
    public output: Array<number> | Uint8Array;
    public op: number;
    public length: number;
    public backwardDistance: number;

    public static Lz77MaxLength = 258;

    public static WindowSize = 0x8000;

    public static MaxCodeLength = 16;

    public static HUFMAX = 286;

    public static Lz77MinLength = 3;

    constructor(input: Array<number> | Uint8Array, opt_params?: any) {
        this.compressionType = CompressionType.DYNAMIC;
        this.lazy = 0;
        this.length = 0;
        this.backwardDistance = 0;
        this.input =
            (USE_TYPEDARRAY && input instanceof Array) ? new Uint8Array(input) : input;
        this.op = 0;
        // option parameters
        if (opt_params) {
            if (opt_params['lazy']) {
                this.lazy = opt_params['lazy'];
            }
            if (typeof opt_params['compressionType'] === 'number') {
                this.compressionType = opt_params['compressionType'];
            }
            if (opt_params['outputBuffer']) {
                this.output =
                    (USE_TYPEDARRAY && opt_params['outputBuffer'] instanceof Array) ?
                        new Uint8Array(opt_params['outputBuffer']) : opt_params['outputBuffer'];
            }
            if (typeof opt_params['outputIndex'] === 'number') {
                this.op = opt_params['outputIndex'];
            }
        }
        if (!this.output) {
            this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(0x8000);
        }
    }

    public static get FixedHuffmanTable() {
        let table = [], i;

        for (i = 0; i < 288; i++) {
            switch (true) {
                case (i <= 143): table.push([i + 0x030, 8]); break;
                case (i <= 255): table.push([i - 144 + 0x190, 9]); break;
                case (i <= 279): table.push([i - 256 + 0x000, 7]); break;
                case (i <= 287): table.push([i - 280 + 0x0C0, 8]); break;
                default:
                    throw 'invalid literal: ' + i;
            }
        }
        return table;
    }

    public compress() {
        let blockArray;
        let position;
        let length;
        let input = this.input;

        switch (this.compressionType) {
            case CompressionType.NONE:
                // each 65535-Byte (length header: 16-bit)
                for (position = 0, length = input.length; position < length;) {
                    blockArray = USE_TYPEDARRAY ?
                        (<Uint8Array>input).subarray(position, position + 0xffff) :
                        input.slice(position, position + 0xffff);
                    position += blockArray.length;
                    this.makeNocompressBlock(blockArray, (position === length));
                }
                break;
            case CompressionType.FIXED:
                this.output = this.makeFixedHuffmanBlock(input, true);
                this.op = this.output.length;
                break;
            case CompressionType.DYNAMIC:
                this.output = this.makeDynamicHuffmanBlock(input, true);
                this.op = this.output.length;
                break;
            default:
                throw 'invalid compression type';
        }
        return this.output;
    }

    public makeNocompressBlock(blockArray: Array<number> | Uint8Array, isFinalBlock: boolean) {
        let bfinal;
        let btype;
        let len;
        let nlen;
        let i;
        let il;

        let output = this.output;
        let op = this.op;

        // expand buffer
        if (USE_TYPEDARRAY) {
            output = new Uint8Array((<Uint8Array>this.output).buffer);
            while (output.length <= op + blockArray.length + 5) {
                output = new Uint8Array(output.length << 1);
            }
            output.set(this.output);
        }

        // header
        bfinal = isFinalBlock ? 1 : 0;
        btype = CompressionType.NONE;
        output[op++] = (bfinal) | (btype << 1);

        // length
        len = blockArray.length;
        nlen = (~len + 0x10000) & 0xffff;
        output[op++] = len & 0xff;
        output[op++] = (len >>> 8) & 0xff;
        output[op++] = nlen & 0xff;
        output[op++] = (nlen >>> 8) & 0xff;

        // copy buffer
        if (USE_TYPEDARRAY) {
            (<Uint8Array>output).set(blockArray, op);
            op += blockArray.length;
            output = (<Uint8Array>output).subarray(0, op);
        } else {
            for (i = 0, il = blockArray.length; i < il; ++i) {
                output[op++] = blockArray[i];
            }
            (<Array<number>>output).length = op;
        }

        this.op = op;
        this.output = output;

        return output;
    }

    public makeFixedHuffmanBlock(blockArray: Array<number> | Uint8Array, isFinalBlock: boolean) {
        /** @type {Zlib.BitStream} */
        let stream = new BitStream(USE_TYPEDARRAY ?
            new Uint8Array((<Uint8Array>this.output).buffer) : this.output, this.op);
        /** @type {number} */
        let bfinal;
        /** @type {Zlib.RawDeflate.CompressionType} */
        let btype;
        /** @type {!(Array.<number>|Uint16Array)} */
        let data;

        // header
        bfinal = isFinalBlock ? 1 : 0;
        btype = CompressionType.FIXED;

        stream.writeBits(bfinal, 1, true);
        stream.writeBits(btype, 2, true);

        data = this.lz77(blockArray);
        this.fixedHuffman(data, stream);

        return stream.finish();
    }

    public makeDynamicHuffmanBlock(blockArray: Array<number> | Uint8Array, isFinalBlock: boolean) {
        let stream = new BitStream(USE_TYPEDARRAY ?
            new Uint8Array((<Uint8Array>this.output).buffer) : this.output, this.op);
        let bfinal;
        let btype;
        let data;
        let hlit;
        let hdist;
        let hclen;
        let hclenOrder =
            [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
        let litLenLengths;
        let litLenCodes;
        let distLengths;
        let distCodes;
        let treeSymbols;
        let treeLengths;
        let transLengths = new Array(19);
        let treeCodes;
        let code;
        let bitlen;
        let i;
        let il;

        // header
        bfinal = isFinalBlock ? 1 : 0;
        btype = CompressionType.DYNAMIC;

        stream.writeBits(bfinal, 1, true);
        stream.writeBits(btype, 2, true);

        data = this.lz77(blockArray);

        litLenLengths = this.getLengths_(this.freqsLitLen, 15);
        litLenCodes = this.getCodesFromLengths_(litLenLengths);
        distLengths = this.getLengths_(this.freqsDist, 7);
        distCodes = this.getCodesFromLengths_(distLengths);

        for (hlit = 286; hlit > 257 && litLenLengths[hlit - 1] === 0; hlit--) { }
        for (hdist = 30; hdist > 1 && distLengths[hdist - 1] === 0; hdist--) { }

        // HCLEN
        treeSymbols =
            this.getTreeSymbols_(hlit, litLenLengths, hdist, distLengths);
        treeLengths = this.getLengths_(treeSymbols.freqs, 7);
        for (i = 0; i < 19; i++) {
            transLengths[i] = treeLengths[hclenOrder[i]];
        }
        for (hclen = 19; hclen > 4 && transLengths[hclen - 1] === 0; hclen--) { }

        treeCodes = this.getCodesFromLengths_(treeLengths);

        stream.writeBits(hlit - 257, 5, true);
        stream.writeBits(hdist - 1, 5, true);
        stream.writeBits(hclen - 4, 4, true);
        for (i = 0; i < hclen; i++) {
            stream.writeBits(transLengths[i], 3, true);
        }

        for (i = 0, il = treeSymbols.codes.length; i < il; i++) {
            code = treeSymbols.codes[i];

            stream.writeBits(treeCodes[code], treeLengths[code], true);

            // extra bits
            if (code >= 16) {
                i++;
                switch (code) {
                    case 16: bitlen = 2; break;
                    case 17: bitlen = 3; break;
                    case 18: bitlen = 7; break;
                    default:
                        throw 'invalid code: ' + code;
                }

                stream.writeBits(treeSymbols.codes[i], bitlen, true);
            }
        }

        this.dynamicHuffman(
            data,
            [litLenCodes, litLenLengths],
            [distCodes, distLengths],
            stream
        );

        return stream.finish();
    }

    public dynamicHuffman(dataArray: Array<number> | Uint16Array, litLen: any[], dist: any[], stream: any) {
        let index;
        let length;
        let literal;
        let code;
        let litLenCodes;
        let litLenLengths;
        let distCodes;
        let distLengths;

        litLenCodes = litLen[0];
        litLenLengths = litLen[1];
        distCodes = dist[0];
        distLengths = dist[1];

        // 符号を BitStream に書き込んでいく
        for (index = 0, length = dataArray.length; index < length; ++index) {
            literal = dataArray[index];

            // literal or length
            stream.writeBits(litLenCodes[literal], litLenLengths[literal], true);

            // 長さ・距離符号
            if (literal > 256) {
                // length extra
                stream.writeBits(dataArray[++index], dataArray[++index], true);
                // distance
                code = dataArray[++index];
                stream.writeBits(distCodes[code], distLengths[code], true);
                // distance extra
                stream.writeBits(dataArray[++index], dataArray[++index], true);
                // 終端
            } else if (literal === 256) {
                break;
            }
        }

        return stream;
    }

    public fixedHuffman(dataArray: Array<number> | Uint16Array, stream: BitStream) {

        let index;
        let length;
        let literal;

        for (index = 0, length = dataArray.length; index < length; index++) {
            literal = dataArray[index];
            BitStream.prototype.writeBits.apply(
                stream, RawDeflate.FixedHuffmanTable[literal]
            )
            if (literal > 0x100) {
                stream.writeBits(dataArray[++index], dataArray[++index], true);
                stream.writeBits(dataArray[++index], 5);
                stream.writeBits(dataArray[++index], dataArray[++index], true);
            } else if (literal === 0x100) {
                break;
            }
        }
        return stream;
    }

    public lz77(dataArray: Array<number> | Uint8Array) {
        let position = 0;
        let length = 0;
        let i = 0;
        let il = 0;
        let matchKey = 0;
        let table = {};
        let windowSize = RawDeflate.WindowSize;
        let matchsList = [];
        let longestMatch;
        let prevMatch;
        let lz77buf = USE_TYPEDARRAY ?
            new Uint16Array(dataArray.length * 2) : new Array<number>();
        let pos = 0;
        let skipLength = 0;
        let freqsLitLen = new (USE_TYPEDARRAY ? Uint32Array : Array)(286);
        let freqsDist = new (USE_TYPEDARRAY ? Uint32Array : Array)(30);
        let lazy = this.lazy;
        let tmp;

        if (!USE_TYPEDARRAY) {
            for (i = 0; i <= 285;) { freqsLitLen[i++] = 0; }
            for (i = 0; i <= 29;) { freqsDist[i++] = 0; }
        }
        freqsLitLen[256] = 1;
        const writeMatch = (match: Lz77Match, offset: number) => {
            let lz77Array = match.toLz77Array();

            for (i = 0, il = lz77Array.length; i < il; ++i) {
                lz77buf[pos++] = lz77Array[i];
            }
            freqsLitLen[lz77Array[0]]++;
            freqsDist[lz77Array[3]]++;
            skipLength = match.length + offset - 1;
            prevMatch = null;
        }

        for (position = 0, length = dataArray.length; position < length; ++position) {
            for (matchKey = 0, i = 0, il = RawDeflate.Lz77MinLength; i < il; ++i) {
                if (position + i === length) {
                    break;
                }
                matchKey = (matchKey << 8) | dataArray[position + i];
            }

            if (!table[matchKey]) {
                table[matchKey] = [];
                matchsList = table[matchKey];
            } else {
                matchsList = table[matchKey];
            }

            if (skipLength-- > 0) {
                matchsList.push(position);
                continue;
            }
            while (matchsList.length > 0 && position - matchsList[0] > windowSize) {
                matchsList.shift();
            }

            if (position + RawDeflate.Lz77MinLength >= length) {
                if (prevMatch) {
                    writeMatch(prevMatch, -1);
                }

                for (i = 0, il = length - position; i < il; ++i) {
                    tmp = dataArray[position + i];
                    lz77buf[pos++] = tmp;
                    ++freqsLitLen[tmp];
                }
                break;
            }

            if (matchsList.length > 0) {
                longestMatch = this.searchLongestMatch_(dataArray, position, matchsList);
                if (prevMatch) {
                    if (prevMatch.length < longestMatch.length) {
                        // write previous literal
                        tmp = dataArray[position - 1];
                        lz77buf[pos++] = tmp;
                        ++freqsLitLen[tmp];

                        // write current match
                        writeMatch(longestMatch, 0);
                    } else {
                        // write previous match
                        writeMatch(prevMatch, -1);
                    }
                } else if (longestMatch.length < lazy) {
                    prevMatch = longestMatch;
                } else {
                    writeMatch(longestMatch, 0);
                }
            } else if (prevMatch) {
                writeMatch(prevMatch, -1);
            } else {
                tmp = dataArray[position];
                lz77buf[pos++] = tmp;
                ++freqsLitLen[tmp];
            }

            matchsList.push(position);
        }

        lz77buf[pos++] = 256;
        freqsLitLen[256]++;
        this.freqsLitLen = freqsLitLen;
        this.freqsDist = freqsDist;

        return /** @type {!(Uint16Array|Array.<number>)} */ (
            USE_TYPEDARRAY ? (<Uint16Array>lz77buf).subarray(0, pos) : lz77buf
        );
    }

    public searchLongestMatch_(data: any, position: number, matchList: Array<number>) {
        let match,
            currentMatch,
            matchMax = 0, matchLength,
            i, j, l, dl = data.length;

        permatch:
        for (i = 0, l = matchList.length; i < l; i++) {
            match = matchList[l - i - 1];
            matchLength = RawDeflate.Lz77MinLength;

            if (matchMax > RawDeflate.Lz77MinLength) {
                for (j = matchMax; j > RawDeflate.Lz77MinLength; j--) {
                    if (data[match + j - 1] !== data[position + j - 1]) {
                        continue permatch;
                    }
                }
                matchLength = matchMax;
            }

            while (matchLength < RawDeflate.Lz77MaxLength &&
                position + matchLength < dl &&
                data[match + matchLength] === data[position + matchLength]) {
                ++matchLength;
            }

            if (matchLength > matchMax) {
                currentMatch = match;
                matchMax = matchLength;
            }

            if (matchLength === RawDeflate.Lz77MaxLength) {
                break;
            }
        }
        return new Lz77Match(matchMax, position - currentMatch);
    }

    public getTreeSymbols_(hlit: number,
        litlenLengths: Array<number> | Uint8Array,
        hdist: number,
        distLengths: Array<number> | Uint8Array) {

        let src = new (USE_TYPEDARRAY ? Uint32Array : Array)(hlit + hdist),
            i, j, runLength, l,
            result = new (USE_TYPEDARRAY ? Uint32Array : Array)(286 + 30),
            nResult,
            rpt,
            freqs = new (USE_TYPEDARRAY ? Uint8Array : Array)(19);

        j = 0;
        for (i = 0; i < hlit; i++) {
            src[j++] = litlenLengths[i];
        }
        for (i = 0; i < hdist; i++) {
            src[j++] = distLengths[i];
        }

        if (!USE_TYPEDARRAY) {
            for (i = 0, l = freqs.length; i < l; ++i) {
                freqs[i] = 0;
            }
        }

        nResult = 0;
        for (i = 0, l = src.length; i < l; i += j) {
            for (j = 1; i + j < l && src[i + j] === src[i]; ++j) { }

            runLength = j;

            if (src[i] === 0) {
                if (runLength < 3) {
                    while (runLength-- > 0) {
                        result[nResult++] = 0;
                        freqs[0]++;
                    }
                } else {
                    while (runLength > 0) {
                        rpt = (runLength < 138 ? runLength : 138);

                        if (rpt > runLength - 3 && rpt < runLength) {
                            rpt = runLength - 3;
                        }

                        if (rpt <= 10) {
                            result[nResult++] = 17;
                            result[nResult++] = rpt - 3;
                            freqs[17]++;
                        } else {
                            result[nResult++] = 18;
                            result[nResult++] = rpt - 11;
                            freqs[18]++;
                        }

                        runLength -= rpt;
                    }
                }
            } else {
                result[nResult++] = src[i];
                freqs[src[i]]++;
                runLength--;

                if (runLength < 3) {
                    while (runLength-- > 0) {
                        result[nResult++] = src[i];
                        freqs[src[i]]++;
                    }
                } else {
                    while (runLength > 0) {
                        rpt = (runLength < 6 ? runLength : 6);

                        if (rpt > runLength - 3 && rpt < runLength) {
                            rpt = runLength - 3;
                        }

                        result[nResult++] = 16;
                        result[nResult++] = rpt - 3;
                        freqs[16]++;

                        runLength -= rpt;
                    }
                }
            }
        }
        return {
            codes:
                USE_TYPEDARRAY ? (<Uint32Array>result).subarray(0, nResult) : result.slice(0, nResult),
            freqs: freqs
        };
    }

    public getLengths_(freqs: Array<number> | Uint8Array | Uint32Array, limit: number) {

        let nSymbols = freqs.length;
        let heap = new Heap(2 * RawDeflate.HUFMAX);
        let length = new (USE_TYPEDARRAY ? Uint8Array : Array)(nSymbols);
        let nodes;
        let values;
        let codeLength;

        let i;
        let il;

        if (!USE_TYPEDARRAY) {
            for (i = 0; i < nSymbols; i++) {
                length[i] = 0;
            }
        }

        for (i = 0; i < nSymbols; ++i) {
            if (freqs[i] > 0) {
                heap.push(i, freqs[i]);
            }
        }
        nodes = new Array(heap.length / 2);
        values = new (USE_TYPEDARRAY ? Uint32Array : Array)(heap.length / 2);

        if (nodes.length === 1) {
            length[heap.pop().index] = 1;
            return length;
        }

        for (i = 0, il = heap.length / 2; i < il; ++i) {
            nodes[i] = heap.pop();
            values[i] = nodes[i].value;
        }
        codeLength = this.reversePackageMerge_(values, values.length, limit);

        for (i = 0, il = nodes.length; i < il; ++i) {
            length[nodes[i].index] = codeLength[i];
        }

        return length;
    }

    public reversePackageMerge_(freqs: Array<number> | Uint32Array, symbols: number, limit: number) {

        let minimumCost = new (USE_TYPEDARRAY ? Uint16Array : Array)(limit);
        let flag = new (USE_TYPEDARRAY ? Uint8Array : Array)(limit);
        let codeLength = new (USE_TYPEDARRAY ? Uint8Array : Array)(symbols);
        let value = new Array(limit);
        let type = new Array(limit);
        let currentPosition = new Array(limit);

        let excess = (1 << limit) - symbols;
        let half = (1 << (limit - 1));
        let i;
        let j;
        let t;
        let weight;
        let next;

        const takePackage = (index: number) => {

            let x = type[index][currentPosition[index]];

            if (x === symbols) {
                takePackage(index + 1);
                takePackage(index + 1);
            } else {
                --codeLength[x];
            }

            ++currentPosition[index];
        }

        minimumCost[limit - 1] = symbols;

        for (j = 0; j < limit; ++j) {
            if (excess < half) {
                flag[j] = 0;
            } else {
                flag[j] = 1;
                excess -= half;
            }
            excess <<= 1;
            minimumCost[limit - 2 - j] = (minimumCost[limit - 1 - j] / 2 | 0) + symbols;
        }
        minimumCost[0] = flag[0];

        value[0] = new Array(minimumCost[0]);
        type[0] = new Array(minimumCost[0]);
        for (j = 1; j < limit; ++j) {
            if (minimumCost[j] > 2 * minimumCost[j - 1] + flag[j]) {
                minimumCost[j] = 2 * minimumCost[j - 1] + flag[j];
            }
            value[j] = new Array(minimumCost[j]);
            type[j] = new Array(minimumCost[j]);
        }

        for (i = 0; i < symbols; ++i) {
            codeLength[i] = limit;
        }

        for (t = 0; t < minimumCost[limit - 1]; ++t) {
            value[limit - 1][t] = freqs[t];
            type[limit - 1][t] = t;
        }

        for (i = 0; i < limit; ++i) {
            currentPosition[i] = 0;
        }

        if (flag[limit - 1] === 1) {
            --codeLength[0];
            ++currentPosition[limit - 1];
        }

        for (j = limit - 2; j >= 0; --j) {
            i = 0;
            weight = 0;
            next = currentPosition[j + 1];

            for (t = 0; t < minimumCost[j]; t++) {
                weight = value[j + 1][next] + value[j + 1][next + 1];

                if (weight > freqs[i]) {
                    value[j][t] = weight;
                    type[j][t] = symbols;
                    next += 2;
                } else {
                    value[j][t] = freqs[i];
                    type[j][t] = i;
                    ++i;
                }
            }

            currentPosition[j] = 0;
            if (flag[j] === 1) {
                takePackage(j);
            }
        }

        return codeLength;
    }

    public getCodesFromLengths_(lengths: Uint8Array | Array<number>) {
        let codes = new (USE_TYPEDARRAY ? Uint16Array : Array)(lengths.length);
        let count: number[] = [];
        let startCode: number[] = [];
        let code = 0, i, il, j, m;

        // Count the codes of each length.
        for (i = 0, il = lengths.length; i < il; i++) {
            count[lengths[i]] = (count[lengths[i]] | 0) + 1;
        }

        // Determine the starting code for each length block.
        for (i = 1, il = RawDeflate.MaxCodeLength; i <= il; i++) {
            startCode[i] = code;
            code += count[i] | 0;
            code <<= 1;
        }

        // Determine the code for each symbol. Mirrored, of course.
        for (i = 0, il = lengths.length; i < il; i++) {
            code = startCode[lengths[i]];
            startCode[lengths[i]] += 1;
            codes[i] = 0;

            for (j = 0, m = lengths[i]; j < m; j++) {
                codes[i] = (codes[i] << 1) | (code & 1);
                code >>>= 1;
            }
        }
        return codes;
    }
}
