import { USE_TYPEDARRAY } from './define/typedarray/hybrid';

/**
 * build huffman table from length list.
 * @param {!(Array.<number>|Uint8Array)} lengths length list.
 * @return {!Array} huffman table.
 */
export class Huffman {
    constructor() {
    
    }
    public static buildHuffmanTable(lengths: Array<number>|Uint8Array) {
        /** @type {number} length list size. */
        let listSize = lengths.length;
        /** @type {number} max code length for table size. */
        let maxCodeLength = 0;
        /** @type {number} min code length for table size. */
        let minCodeLength = Number.POSITIVE_INFINITY;
        /** @type {number} table size. */
        let size;
        /** @type {!(Array|Uint8Array)} huffman code table. */
        let table;
        /** @type {number} bit length. */
        let bitLength;
        /** @type {number} huffman code. */
        let code;
        let skip;
        /** @type {number} reversed code. */
        let reversed;
        /** @type {number} reverse temp. */
        let rtemp;
        /** @type {number} loop counter. */
        let i;
        /** @type {number} loop limit. */
        let il;
        /** @type {number} loop counter. */
        let j;
        /** @type {number} table value. */
        let value;

        for (i = 0, il = listSize; i < il; ++i) {
            if (lengths[i] > maxCodeLength) {
            maxCodeLength = lengths[i];
            }
            if (lengths[i] < minCodeLength) {
            minCodeLength = lengths[i];
            }
        }

        size = 1 << maxCodeLength;
        table = new (USE_TYPEDARRAY ? Uint32Array : Array)(size);
        for (bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength;) {
            for (i = 0; i < listSize; ++i) {
            if (lengths[i] === bitLength) {
                for (reversed = 0, rtemp = code, j = 0; j < bitLength; ++j) {
                reversed = (reversed << 1) | (rtemp & 1);
                rtemp >>= 1;
                }

                value = (bitLength << 16) | i;
                for (j = reversed; j < size; j += skip) {
                table[j] = value;
                }

                ++code;
            }
            }

            ++bitLength;
            code <<= 1;
            skip <<= 1;
        }

        return [table, maxCodeLength, minCodeLength];
    }
}
