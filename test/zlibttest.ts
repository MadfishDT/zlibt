// create float data
/*const datas = [1, 2, 3, 4, 5, 6];
const floats = new Float32Array(datas.length);
for (let i = 0; i < datas.length; i++) {
    floats[i] = datas[i];
}

// represent float as byte
const floatsAsByte = new Uint8Array(floats.buffer);
console.log(floatsAsByte);
// compress
const deflate = new Deflate(floatsAsByte, { compressionType: 0 });
const compress = deflate.compress();

console.log("compressed", compress);
//decompress
const inflate = new Inflate(compress);
const plain = inflate.decompress();

// compare results
console.log(plain);
*/
import * as Zlib from "../src/zlibt";

const datas = [1, 2, 3, 4, 5, 6];

const stringToByteArray = (str) => {
    const array = new Uint8Array(str.length);
    let i;
    let il;
    for (i = 0, il = str.length; i < il; ++i) {
        array[i] = str.charCodeAt(i) & 0xff;
    }
    return array;
};

try {
    // Number byte array compressionts
    {
        const floats = new Float32Array(datas.length);
        for (let i = 0; i < datas.length; i++) {
            floats[i] = datas[i];
        }
        const floatsAsByte = new Uint8Array(floats.buffer);
        console.log("number array to Uint8Array: ", floatsAsByte);
        // compress
        const deflate = new Zlib.Deflate(floatsAsByte, { compressionType: 0 });
        const compress = deflate.compress();
        //decompress
        const inflate = new Zlib.Inflate(compress);
        const plain = inflate.decompress();

        const decombuffer = new Uint8Array(plain);
        const floats_plain = new Float32Array(decombuffer.buffer);
        console.log(
            "float, uint8 array to decomress to number array: ",
            Array.from(floats_plain)
        );
    }

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

    console.log(`zip input data: ${datas}`);
    var zip = new Zlib.Zip();
    zip.addFile(datas, {
        filename: stringToByteArray("foo.txt"),
    });
    var zipcompressed = zip.compress();
    var unzip = new Zlib.Unzip(zipcompressed);
    const filenames = unzip.getFilenames();
    console.log(`unzip filenames result: ${filenames}`);
    const externalFA = unzip.getFileHeaderAttribute(
        "foo.txt",
        "externalFileAttributes"
    );
    const filemode = (externalFA >>> 16) & 0xffff;
    console.log(`unzip filemode result: ${filemode}`);

    var resultUnzipArray = Array.from(unzip.decompress("foo.txt"));
    console.log(`unzip uncompress result: ${resultUnzipArray}`);

    console.log("success all module basic test");
} catch (e) {
    console.log("fail test", e);
}
