# zlibt2
* **zlib js full convert to typescript for typescript, javscript, nodejs**
* **zlib.js is ZLIB(RFC1950), DEFLATE(RFC1951), GZIP(RFC1952) and PKZIP implementation in JavaScript.**

**original zlibjs code**
* zlib min file: https://github.com/imaya/zlib.js.git

**install**
-
```
npm inatall zlibt2
```

**support features:**
- Raw Deflate
- Raw Inflate
- Deflate
- Inflate
- GZIP
- GUNZIP
- PKZIP(zip)
- PKUNZIP(unzip)
    - file attribute get operator support
- UMD support(pure web support, but not tested yet)
- Node js support
- Typescript support(tested on angular 4)
- No dependency(pure typescript)

**dependency:**
-
* APIS
    * there is no dependencies

**ZLib APIS**
-
* Zlib TypeScript

**rawdeflate, rawinflate**
```ts
import { RawDeflate, RawInflate } from 'zlibt2';

    //compress
    const datas = [1, 2, 3, 4, 5, 6];
    const rawDeflate = new RawDeflate(datas);
    const rawCompress = rawDeflate.compress();

    //decompress
    const rawInflate = new RawInflate(rawCompress);
    const rawPlain = rawInflate.decompress();
```

**deflate, inflate**
```ts
import { Deflate, Inflate } from 'zlibt2';

    //compress
    const datas = [1, 2, 3, 4, 5, 6];
    const deflate = new Deflate(datas);
    const compress = deflate.compress();

    //decompress
    const inflate = new Inflate(compress);
    const plain = inflate.decompress();
```

**gzip, gunzip**
```ts
import { RawDeflate, RawInflate } from 'zlibt2';

    //compress
    const datas = [1, 2, 3, 4, 5, 6];
    const gzip = new Gzip(datas);
    const compressed = gzip.compress();

    //decompress
    const gunzip = new Gunzip(compressed);
    const resultGZipArray = Array.from(gunzip.decompress());
```

**pkzip, pkunzip(zip, unzip)**
```ts
import { RawDeflate, RawInflate } from 'zlibt2';

    //compress
    const datas = [1, 2, 3, 4, 5, 6];
    const zip = new Zip();
    zip.addFile(datas, {
        filename: this.stringToByteArray('foo.txt')
    });
    const zipcompressed = zip.compress();
    const unzip = new Unzip(zipcompressed);
    const filenames =  unzip.getFilenames();
    const externalFA = unzip.getFileHeaderAttribute(filenames[0], 'externalFileAttributes');

    //get file mode from zip file
    const filemode = (externalFA >>> 16) & 0xffff;
    const resultUnzipArray = Array.from(unzip.decompress('foo.txt', null));
```

* Zlib JavaScript

**rawdeflate, rawinflate**
```js
const Zlib = require('zlibt2');

    const rawDeflate = new Zlib.RawDeflate(datas);
    const rawCompress = rawDeflate.compress();

    const rawInflate = new Zlib.RawInflate(rawCompress);
    const rawPlain = rawInflate.decompress();
    var resultRawArray = Array.from(rawPlain);
```

**deflate, inflate**
```js
const Zlib = require('zlibt2');

    const deflate = new Zlib.Deflate(datas);
    const compress = deflate.compress();

    const inflate = new Zlib.Inflate(compress);
    const plain = inflate.decompress();
    var resultArray = Array.from(plain);
```

**gzip, gunzip**
```js
const Zlib = require('zlibt2');

    var gzip = new Zlib.Gzip(datas);
    var compressed = gzip.compress();

    var gunzip = new Zlib.Gunzip(compressed);
    var resultGZipArray = Array.from(gunzip.decompress());
```

**pkzip, pkunzip(zip, unzip)**
```js
const Zlib = require('zlibt2');

    function stringToByteArray(str) {
        var array = new Uint8Array(str.length);
        var i;
        var il;
    
        for (i = 0, il = str.length; i < il; ++i) {
            array[i] = str.charCodeAt(i) & 0xff;
        }
    
        return array;
    }
    var zip = new Zlib.Zip();
    zip.addFile(datas, {
        filename: stringToByteArray('foo.txt')
    });
    var zipcompressed = zip.compress();
    var unzip = new Zlib.Unzip(zipcompressed);
    const filenames =  unzip.getFilenames();
    const externalFA = unzip.getFileHeaderAttribute('foo.txt', 'externalFileAttributes');
    const filemode = (externalFA >>> 16) & 0xffff;
    var resultUnzipArray = Array.from(unzip.decompress('foo.txt'));
```
* Zlib Compress Options

```js
{
    compressionType: Zlib.Deflate.CompressionType, // compression type
    lazy: number // lazy matching parameter
}
```

* Zlib Decompress Options

```js
{
    'index': number, // start position in input buffer 
    'bufferSize': number, // initial output buffer size
    'bufferType': Zlib.Inflate.BufferType, // buffer expantion type
    'resize': boolean, // resize buffer(ArrayBuffer) when end of decompression (default: false)
    'verify': boolean  // verify decompression result (default: false)
}
```

* GZip Compress Options

```js
{
    deflateOptions: Object, // see: deflate option (ZLIB Option)
    flags: {
        fname: boolean, // use filename?
        comment: boolean, // use comment?
        fhcrc: boolean // use file checksum?
    },
    filename: string, // filename
    comment: string // comment
}
```
