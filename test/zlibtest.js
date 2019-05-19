const Deflate = require('../dist/dev/zlibt.dev').Deflate;
const Inflate = require('../dist/dev/zlibt.dev').Inflate;
console.log('zlib test start');
const datas = [1, 2, 3, 4, 5, 6];
const deflate = new Deflate(datas);
const compress = deflate.compress();
console.log('zlib test compressed');
    //decompress
const inflate = new Inflate(compress);
const plain = inflate.decompress();
console.log(plain);
