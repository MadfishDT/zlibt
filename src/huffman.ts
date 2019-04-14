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
        /**
         * サイズが 2^maxlength 個のテーブルを埋めるためのスキップ長.
         * @type {number} skip length for table filling.
         */
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

        // Math.max は遅いので最長の値は for-loop で取得する
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

        // ビット長の短い順からハフマン符号を割り当てる
        for (bitLength = 1, code = 0, skip = 2; bitLength <= maxCodeLength;) {
            for (i = 0; i < listSize; ++i) {
            if (lengths[i] === bitLength) {
                // ビットオーダーが逆になるためビット長分並びを反転する
                for (reversed = 0, rtemp = code, j = 0; j < bitLength; ++j) {
                reversed = (reversed << 1) | (rtemp & 1);
                rtemp >>= 1;
                }

                // 最大ビット長をもとにテーブルを作るため、
                // 最大ビット長以外では 0 / 1 どちらでも良い箇所ができる
                // そのどちらでも良い場所は同じ値で埋めることで
                // 本来のビット長以上のビット数取得しても問題が起こらないようにする
                value = (bitLength << 16) | i;
                for (j = reversed; j < size; j += skip) {
                table[j] = value;
                }

                ++code;
            }
            }

            // 次のビット長へ
            ++bitLength;
            code <<= 1;
            skip <<= 1;
        }

        return [table, maxCodeLength, minCodeLength];
    }
}
