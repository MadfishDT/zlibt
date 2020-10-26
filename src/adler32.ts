export class Alder {
    public static OptimizationParameter = 1024;
    constructor() {

    }
    public static update(adler: number, array: Array<any> | Uint8Array) {
        let s1 = adler & 0xffff;
        let s2 = (adler >>> 16) & 0xffff;
        let len = array.length;
        let tlen;
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
export const Adler32 = (array: any) => {
    return Alder.update(1, array);
}
