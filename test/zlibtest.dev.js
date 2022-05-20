const Zlib = require('../dist/dev/zlibt.dev');

const datas = [1, 2, 3, 4, 5, 6];
try {

    const floats = new Float32Array(datas.length);
    for (let i = 0; i < datas.length; i++) {
        floats[i] = datas[i];
    }

    const d = new Zlib.Deflate(floats, {});
    const c = d.compress();

    //decompress
    const i = new Zlib.Inflate(c);
    const p = i.decompress();

    // compare results
    console.log(floats);
    console.log(p);

    console.log(`raw input data: ${datas}`);
    const rawDeflate = new Zlib.RawDeflate(datas);
    const rawCompress = rawDeflate.compress();

    const rawInflate = new Zlib.RawInflate(rawCompress);
    const rawPlain = rawInflate.decompress();
    var resultRawArray = Array.from(rawPlain);
    console.log(`raw uncompress result: ${resultRawArray}`);

    //zlib test
    console.log(`zlib input data: ${datas}`);
    const deflate = new Zlib.Deflate(datas);
    const compress = deflate.compress();

    const inflate = new Zlib.Inflate(compress);
    const plain = inflate.decompress();
    var resultArray = Array.from(plain);
    console.log(`zlib uncompress result: ${resultArray}`);

    //gzip test
    console.log(`gzip input data: ${datas}`);
    var gzip = new Zlib.Gzip(datas);
    var compressed = gzip.compress();

    var gunzip = new Zlib.Gunzip(compressed);
    var resultGZipArray = Array.from(gunzip.decompress());
    console.log(`gzip uncompress result: ${resultGZipArray}`);

    //pkzip test
    function stringToByteArray(str) {
        var array = new Uint8Array(str.length);
        var i;
        var il;

        for (i = 0, il = str.length; i < il; ++i) {
            array[i] = str.charCodeAt(i) & 0xff;
        }

        return array;
    }
    console.log(`zip input data: ${datas}`);
    var zip = new Zlib.Zip();
    zip.addFile(datas, {
        filename: stringToByteArray('foo.txt')
    });
    var zipcompressed = zip.compress();
    var unzip = new Zlib.Unzip(zipcompressed);
    const filenames = unzip.getFilenames();
    console.log(`unzip filenames result: ${filenames}`);
    const externalFA = unzip.getFileHeaderAttribute('foo.txt', 'externalFileAttributes');
    const filemode = (externalFA >>> 16) & 0xffff;
    console.log(`unzip filemode result: ${filemode}`);

    var resultUnzipArray = Array.from(unzip.decompress('foo.txt'));
    console.log(`unzip uncompress result: ${resultUnzipArray}`);

    console.log('success all module basic test');
} catch (e) {
    console.log('fail test', e)
}
