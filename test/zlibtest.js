const Zlib = require('../dist/dev/zlibt.dev');

const datas = [1, 2, 3, 4, 5, 6];
console.log(`input data: ${datas}`);
const deflate = new Zlib.Deflate(datas);
const compress = deflate.compress();

const inflate = new Zlib.Inflate(compress);
const plain = inflate.decompress();
var resultArray = Array.from(plain);

console.log(`result: ${resultArray}`);

var gzip = new Zlib.Gzip(datas);
var compressed = gzip.compress();