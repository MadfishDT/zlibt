# zlibt
* **zlib js custom for typescript and javscript**
* **zlib.js is ZLIB(RFC1950), DEFLATE(RFC1951), GZIP(RFC1952) and PKZIP implementation in JavaScript.**

**original zlibjs code**
* zlib min file: https://github.com/imaya/zlib.js.git
* zlib typescript declaration: https://github.com/imaya/zlib.js/issues/47#issuecomment-351906524

**zlibt is deprecated someday**
-
- use version2 https://www.npmjs.com/package/zlibt2
- versino2 support full zlibjs features

**install**
-
```
npm inatall zlibt
```

**support features:**
-
* zlib_and_gzip.min.js functions support
    * zlib.min.js: ZLIB Inflate + Deflate
    * inflate.min.js: ZLIB Inflate
    * deflate.min.js: ZLIB Deflate
    * inflate_stream.min.js: ZLIB Inflate (stream mode)
    * command line argument support(~0.0.2)

**dependency:**
-
* APIS
    * there is no dependencies

* CLI
    * fs
    * path

**Command Line Interface**
-

### CLI switch

```
zlibt {{command}} {{inputFilePath}} {{outFilePath}} 
```

| switch   |      value      |  default |
|----------|:-------------:  |------:   |
| command  |  'c', 'u'          | c: compress, u:uncompress|
| inputFilePath  |  "./xxxxx/zzz.json"           |   "" |
| outFilePath | "./xxxxx/zzz.z" |""|


- example compress
```js
zlibt c file.txt file.txt.z
```

- example uncompress
```js
zlibt u file.txt.z file.txt
```

**ZLib APIS**
-
* Zlib TypeScript

```
import { Zlib } from 'zlibt';

    //compress
    const datas: number[] = [1, 2, 3, 4, 5, 6];
    const deflate = new Zlib.Deflate(datas, null);
    const compress = deflate.compress();

    //decompress
    const inflate = new Zlib.Inflate(compress, null);
    const plain = inflate.decompress();
```
* Zlib JavaScript

```
var  Zlib = require('zlibt').Zlib;

    //compress
    var datas = [1, 2, 3, 4, 5, 6];
    var deflate = new Zlib.Deflate(datas);
    var compress = deflate.compress();

    /decompress
    var inflate = new Zlib.Inflate(compress);
    var plain = inflate.decompress();
```

* Zlib Compress Options

```
{
    compressionType: Zlib.Deflate.CompressionType, // compression type
    lazy: number // lazy matching parameter
}
```

* Zlib Decompress Options

```
{
    'index': number, // start position in input buffer 
    'bufferSize': number, // initial output buffer size
    'bufferType': Zlib.Inflate.BufferType, // buffer expantion type
    'resize': boolean, // resize buffer(ArrayBuffer) when end of decompression (default: false)
    'verify': boolean  // verify decompression result (default: false)
}
```
**GZip APIS**
* GZip TypeScript
```
import { Zlib } from 'zlibt';

    //compress
    const datas: number[] = [1, 2, 3, 4, 5, 6];
    const deflate = new Zlib.Gzip(datas, null);
    const compress = deflate.compress();

    //decompress
    const inflate = new Zlib.Gunzip(compress);
    const plain = inflate.decompress();
```

* GZip JavaScript
```
var  Zlib = require('zlibt').Zlib;

    //compress
    var gzip = new Zlib.Gzip(plain);
    var compressed = gzip.compress();

    //decompress
    var gunzip = new Zlib.Gunzip(compressed);
    var plain = gunzip.decompress()
```


* GZip Compress Options

```
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
