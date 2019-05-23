import { RawDeflate } from './rawdeflate';
import { CRC32 } from './crc32';
import { USE_TYPEDARRAY } from './define/typedarray/hybrid';


  

export class Zip {

    public static Flags = {
        ENCRYPT:    0x0001,
        DESCRIPTOR: 0x0008,
        UTF8:       0x0800
    };

    public static CompressionMethod = {
        STORE: 0,
        DEFLATE: 8
    };

    public static OperatingSystem ={
        MSDOS: 0,
        UNIX: 3,
        MACINTOSH: 7
    };
      
    private files = [];
    private comment: Array<number>|Uint8Array;
    private password: Array<number>|Uint8Array;
    constructor(opt_params?: any) {
        opt_params = opt_params || {};
        this.files = [];
        /** @type {(Array.<number>|Uint8Array)} */
        this.comment = opt_params['comment'];
        /** @type {(Array.<number>|Uint8Array)} */
    }

    public static FileHeaderSignature = [0x50, 0x4b, 0x01, 0x02];

    public static LocalFileHeaderSignature = [0x50, 0x4b, 0x03, 0x04];

    public static CentralDirectorySignature = [0x50, 0x4b, 0x05, 0x06];

    public addFile(input: Array<number> | Uint8Array, opt_params: any) {
        opt_params = opt_params || {};
        let compressed;
        let size = input.length;
        let crc32 = 0;
      
        if (USE_TYPEDARRAY && input instanceof Array) {
            input = new Uint8Array(input);
        }
      
        if (typeof opt_params['compressionMethod'] !== 'number') {
            opt_params['compressionMethod'] = Zip.CompressionMethod.DEFLATE;
        }
      
        if (opt_params['compress']) {
            switch (opt_params['compressionMethod']) {
                case Zip.CompressionMethod.STORE:
                    break;
                case Zip.CompressionMethod.DEFLATE:
                    crc32 = CRC32.calc(input);
                    input = this.deflateWithOption(input, opt_params);
                    compressed = true;
                    break;
                default:
                    throw new Error('unknown compression method:' + opt_params['compressionMethod']);
            }
        }
      
        this.files.push({
            buffer: input,
            option: opt_params,
            compressed: compressed,
            encrypted: false,
            size: size,
            crc32: crc32
        });
    }

    public setPassword(password: Array<number>|Uint8Array) {
        this.password = password;
    }

    public compress() {
        let files = this.files;
        let file;
        let output;
        let op1;
        let op2;
        let op3;
        let localFileSize = 0;
        let centralDirectorySize = 0;
        let endOfCentralDirectorySize;
        let offset;
        let needVersion;
        let flags;
        let compressionMethod;
        let date;
        let crc32;
        let size;
        let plainSize;
        let filenameLength;
        let extraFieldLength;
        let commentLength;
        let filename;
        let extraField;
        let comment;
        let buffer;
        let tmp;
        let key;
        let i;
        let il;
        let j;
        let jl;

        for (i = 0, il = files.length; i < il; ++i) {
            file = files[i];
            filenameLength =
                (file.option['filename']) ? file.option['filename'].length : 0;
            extraFieldLength =
                (file.option['extraField']) ? file.option['extraField'].length : 0;
            commentLength =
                (file.option['comment']) ? file.option['comment'].length : 0;
        
            if (!file.compressed) {
                file.crc32 = CRC32.calc(file.buffer);
        
                switch (file.option['compressionMethod']) {
                case Zip.CompressionMethod.STORE:
                    break;
                case Zip.CompressionMethod.DEFLATE:
                    file.buffer = this.deflateWithOption(file.buffer, file.option);
                    file.compressed = true;
                    break;
                default:
                    throw new Error('unknown compression method:' + file.option['compressionMethod']);
                }
            }
      
          // encryption
            if (file.option['password'] !== void 0|| this.password !== void 0) {
                // init encryption
                key = Zip.createEncryptionKey(file.option['password'] || this.password);
        
                // add header
                buffer = file.buffer;
                if (USE_TYPEDARRAY) {
                    tmp = new Uint8Array(buffer.length + 12);
                    tmp.set(buffer, 12);
                    buffer = tmp;
                } else {
                    buffer.unshift(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
                }
        
                for (j = 0; j < 12; ++j) {
                    buffer[j] = this.encode(
                        key,
                        i === 11 ? (file.crc32 & 0xff) : (Math.random() * 256 | 0)
                    );
                }
        
                // data encryption
                for (jl = buffer.length; j < jl; ++j) {
                    buffer[j] = this.encode(key, buffer[j]);
                }
                file.buffer = buffer;
            }
      
          // 必要バッファサイズの計算
            localFileSize +=
            // local file header
            30 + filenameLength +
            // file data
            file.buffer.length;
      
            centralDirectorySize +=
            // file header
            46 + filenameLength + commentLength;
        }
      
        // end of central directory
        endOfCentralDirectorySize = 22 + (this.comment ? this.comment.length : 0);
        output = new (USE_TYPEDARRAY ? Uint8Array : Array)(
          localFileSize + centralDirectorySize + endOfCentralDirectorySize
        );
        op1 = 0;
        op2 = localFileSize;
        op3 = op2 + centralDirectorySize;
      
        for (i = 0, il = files.length; i < il; ++i) {
            file = files[i];
            filenameLength =
                file.option['filename'] ? file.option['filename'].length :  0;
            extraFieldLength = 0; // TODO
            commentLength =
                file.option['comment'] ? file.option['comment'].length : 0;
        
            //-------------------------------------------------------------------------
            // local file header & file header
            //-------------------------------------------------------------------------
        
            offset = op1;
        
            // signature
            // local file header
            output[op1++] = Zip.LocalFileHeaderSignature[0];
            output[op1++] = Zip.LocalFileHeaderSignature[1];
            output[op1++] = Zip.LocalFileHeaderSignature[2];
            output[op1++] = Zip.LocalFileHeaderSignature[3];
            // file header
            output[op2++] = Zip.FileHeaderSignature[0];
            output[op2++] = Zip.FileHeaderSignature[1];
            output[op2++] = Zip.FileHeaderSignature[2];
            output[op2++] = Zip.FileHeaderSignature[3];
        
            // compressor info
            needVersion = 20;
            output[op2++] = needVersion & 0xff;
            output[op2++] =
                /** @type {Zlib.Zip.OperatingSystem} */
                (file.option['os']) ||
                Zip.OperatingSystem.MSDOS;
        
            // need version
            output[op1++] = output[op2++] =  needVersion       & 0xff;
            output[op1++] = output[op2++] = (needVersion >> 8) & 0xff;
        
            // general purpose bit flag
            flags = 0;
            if (file.option['password'] || this.password) {
                flags |= Zip.Flags.ENCRYPT;
            }
            output[op1++] = output[op2++] =  flags       & 0xff;
            output[op1++] = output[op2++] = (flags >> 8) & 0xff;
        
            // compression method
            compressionMethod =
                /** @type {Zlib.Zip.CompressionMethod} */
                (file.option['compressionMethod']);
            output[op1++] = output[op2++] =  compressionMethod       & 0xff;
            output[op1++] = output[op2++] = (compressionMethod >> 8) & 0xff;
        
            // date
            date = /** @type {(Date|undefined)} */(file.option['date']) || new Date();
            output[op1++] = output[op2++] =
                ((date.getMinutes() & 0x7) << 5) |
                (date.getSeconds() / 2 | 0);
            output[op1++] = output[op2++] =
                (date.getHours()   << 3) |
                (date.getMinutes() >> 3);
            //
            output[op1++] = output[op2++] =
                ((date.getMonth() + 1 & 0x7) << 5) |
                (date.getDate());
            output[op1++] = output[op2++] =
                ((date.getFullYear() - 1980 & 0x7f) << 1) |
                (date.getMonth() + 1 >> 3);
        
            // CRC-32
            crc32 = file.crc32;
            output[op1++] = output[op2++] =  crc32        & 0xff;
            output[op1++] = output[op2++] = (crc32 >>  8) & 0xff;
            output[op1++] = output[op2++] = (crc32 >> 16) & 0xff;
            output[op1++] = output[op2++] = (crc32 >> 24) & 0xff;
        
            // compressed size
            size = file.buffer.length;
            output[op1++] = output[op2++] =  size        & 0xff;
            output[op1++] = output[op2++] = (size >>  8) & 0xff;
            output[op1++] = output[op2++] = (size >> 16) & 0xff;
            output[op1++] = output[op2++] = (size >> 24) & 0xff;
        
            // uncompressed size
            plainSize = file.size;
            output[op1++] = output[op2++] =  plainSize        & 0xff;
            output[op1++] = output[op2++] = (plainSize >>  8) & 0xff;
            output[op1++] = output[op2++] = (plainSize >> 16) & 0xff;
            output[op1++] = output[op2++] = (plainSize >> 24) & 0xff;
        
            // filename length
            output[op1++] = output[op2++] =  filenameLength       & 0xff;
            output[op1++] = output[op2++] = (filenameLength >> 8) & 0xff;
        
            // extra field length
            output[op1++] = output[op2++] =  extraFieldLength       & 0xff;
            output[op1++] = output[op2++] = (extraFieldLength >> 8) & 0xff;
        
            // file comment length
            output[op2++] =  commentLength       & 0xff;
            output[op2++] = (commentLength >> 8) & 0xff;
        
            // disk number start
            output[op2++] = 0;
            output[op2++] = 0;
        
            // internal file attributes
            output[op2++] = 0;
            output[op2++] = 0;
        
            // external file attributes
            output[op2++] = 0;
            output[op2++] = 0;
            output[op2++] = 0;
            output[op2++] = 0;
        
            // relative offset of local header
            output[op2++] =  offset        & 0xff;
            output[op2++] = (offset >>  8) & 0xff;
            output[op2++] = (offset >> 16) & 0xff;
            output[op2++] = (offset >> 24) & 0xff;
        
            // filename
            filename = file.option['filename'];
            if (filename) {
                if (USE_TYPEDARRAY) {
                output.set(filename, op1);
                output.set(filename, op2);
                op1 += filenameLength;
                op2 += filenameLength;
                } else {
                for (j = 0; j < filenameLength; ++j) {
                    output[op1++] = output[op2++] = filename[j];
                }
                }
            }
        
            // extra field
            extraField = file.option['extraField'];
            if (extraField) {
                if (USE_TYPEDARRAY) {
                output.set(extraField, op1);
                output.set(extraField, op2);
                op1 += extraFieldLength;
                op2 += extraFieldLength;
                } else {
                for (j = 0; j < commentLength; ++j) {
                    output[op1++] = output[op2++] = extraField[j];
                }
                }
            }
        
            // comment
            comment = file.option['comment'];
            if (comment) {
                if (USE_TYPEDARRAY) {
                output.set(comment, op2);
                op2 += commentLength;
                } else {
                for (j = 0; j < commentLength; ++j) {
                    output[op2++] = comment[j];
                }
                }
            }
        
            //-------------------------------------------------------------------------
            // file data
            //-------------------------------------------------------------------------
        
            if (USE_TYPEDARRAY) {
                output.set(file.buffer, op1);
                op1 += file.buffer.length;
            } else {
                for (j = 0, jl = file.buffer.length; j < jl; ++j) {
                output[op1++] = file.buffer[j];
                }
            }
        }
      
        //-------------------------------------------------------------------------
        // end of central directory
        //-------------------------------------------------------------------------
      
        // signature
        output[op3++] = Zip.CentralDirectorySignature[0];
        output[op3++] = Zip.CentralDirectorySignature[1];
        output[op3++] = Zip.CentralDirectorySignature[2];
        output[op3++] = Zip.CentralDirectorySignature[3];
      
        // number of this disk
        output[op3++] = 0;
        output[op3++] = 0;
      
        // number of the disk with the start of the central directory
        output[op3++] = 0;
        output[op3++] = 0;
      
        // total number of entries in the central directory on this disk
        output[op3++] =  il       & 0xff;
        output[op3++] = (il >> 8) & 0xff;
      
        // total number of entries in the central directory
        output[op3++] =  il       & 0xff;
        output[op3++] = (il >> 8) & 0xff;
      
        // size of the central directory
        output[op3++] =  centralDirectorySize        & 0xff;
        output[op3++] = (centralDirectorySize >>  8) & 0xff;
        output[op3++] = (centralDirectorySize >> 16) & 0xff;
        output[op3++] = (centralDirectorySize >> 24) & 0xff;
      
        // offset of start of central directory with respect to the starting disk number
        output[op3++] =  localFileSize        & 0xff;
        output[op3++] = (localFileSize >>  8) & 0xff;
        output[op3++] = (localFileSize >> 16) & 0xff;
        output[op3++] = (localFileSize >> 24) & 0xff;
      
        // .ZIP file comment length
        commentLength = this.comment ? this.comment.length : 0;
        output[op3++] =  commentLength       & 0xff;
        output[op3++] = (commentLength >> 8) & 0xff;
      
        // .ZIP file comment
        if (this.comment) {
            if (USE_TYPEDARRAY) {
                output.set(this.comment, op3);
                op3 += commentLength;
            } else {
                for (j = 0, jl = commentLength; j < jl; ++j) {
                output[op3++] = this.comment[j];
                }
            }
        } 
        return output;
    }

    public deflateWithOption(input: Array<number> | Uint8Array, opt_params: Object) {
        /** @type {Zlib.RawDeflate} */
        const deflator = new RawDeflate(input, opt_params['deflateOption']);
        return deflator.compress();
    }

    public static getByte(key: Array<number> | Uint32Array) {
        const tmp = ((key[2] & 0xffff) | 2);
        return ((tmp * (tmp ^ 1)) >> 8) & 0xff;
    };

    public encode(key: Array<number> | Uint32Array, n: number) {
        /** @type {number} */
        const tmp = Zip.getByte(key);
      
        Zip.updateKeys(key, n);
      
        return tmp ^ n;
    };

    public static updateKeys = function(key: Array<number> | Uint32Array, n: number) {
        key[0] = CRC32.single(key[0], n);
        key[1] =
        (((((key[1] + (key[0] & 0xff)) * 20173 >>> 0) * 6681) >>> 0) + 1) >>> 0;
        key[2] = CRC32.single(key[2], key[1] >>> 24);
    }
    
    public static createEncryptionKey(password: Array<number>|Uint8Array) {
        /** @type {!(Array.<number>|Uint32Array)} */
        const keyOrigin = [305419896, 591751049, 878082192];
        /** @type {number} */
        let i = 0 ;
        /** @type {number} */
        let il = password.length;
        let key = USE_TYPEDARRAY ? new Uint32Array(keyOrigin) : keyOrigin;
    
        for (; i < il; ++i) {
            Zip.updateKeys(key, password[i] & 0xff);
        }
        return key;
    }
}
