import {Deflate, Inflate} from './zlibt';
console.log('zlib test start');
const datas: number[] = [1, 2, 3, 4, 5, 6];
const deflate = new Deflate(datas, null);
const compress = deflate.compress();
console.log('zlib test compressed');
    //decompress
const inflate = new Inflate(compress, null);
const plain = inflate.decompress();
console.log(plain);
