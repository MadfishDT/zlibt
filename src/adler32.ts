
namespace ZlibT {
    export const Adler32 = (array) => {
        return Alder.update(1, array);
    }
    export class Alder {

        public static OptimizationParameter = 1024;
        constructor() {
        
        }
    
        static update(adler, array) {
            /** @type {number} */
            let s1 = adler & 0xffff;
            /** @type {number} */
            let s2 = (adler >>> 16) & 0xffff;
            /** @type {number} array length */
            let len = array.length;
            /** @type {number} loop length (don't overflow) */
            let tlen;
            /** @type {number} array index */
            let i = 0;
        
            while (len > 0) {
            tlen = len > Alder.OptimizationParameter ?
            Alder.OptimizationParameter : len;
            len -= tlen;
            do {
                s1 += array[i++];
                s2 += s1;
            } while (--tlen);
        
            s1 %= 65521;
            s2 %= 65521;
            }
            return ((s2 << 16) | s1) >>> 0;
        }
    }
}