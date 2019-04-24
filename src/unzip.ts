
import { ZlibT } from './zlibt';
import { USE_TYPEDARRAY } from './define/typedarray/hybrid';
/**
 * @param {!(Array.<number>|Uint8Array)} input input buffer.
 * @param {Object=} opt_params options.
 * @constructor
 */
export class FileHeader{
    public input: Array<number> | Uint8Array;
    public offset: number;
    public length: number;
    public version: number;
    public os: number;
    public needVersion: number;
    public flags: number;
    public compression: number;
    public time: number;
    public date: number;
    public crc32: number;
    public compressedSize: number;
    public plainSize: number;
    public fileNameLength: number;
    public extraFieldLength: number;
    public fileCommentLength: number;
    public diskNumberStart: number;
    public internalFileAttributes: number;
    public externalFileAttributes: number;
    public relativeOffset: number;
    public filename: string;
    public extraField: Array<number> | Uint8Array;
    public comment: Array<number> | Uint8Array;

    constructor(input: Array<number> | Uint8Array, ip: number) {
        this.input = input;
        this.offset = ip;
    }
    public static Flags = ZlibT.Zip.Flags;
}

export class LocalFileHeader{

     /** @type {!(Array.<number>|Uint8Array)} */
     public input: Array<number> | Uint8Array;
     /** @type {number} */
     public offset: number;
     /** @type {number} */
     public length: number;
     /** @type {number} */
     public needVersion: number;
     /** @type {number} */
     public flags: number;
     /** @type {number} */
     public compression: number;
     /** @type {number} */
     public time: number;
     /** @type {number} */
     public date: number;
     /** @type {number} */
     public crc32: number;
     /** @type {number} */
     public compressedSize: number;
     /** @type {number} */
     public plainSize: number;
     /** @type {number} */
     public fileNameLength: number;
     /** @type {number} */
     public extraFieldLength: number;
     /** @type {string} */
     public filename: string;
     /** @type {!(Array.<number>|Uint8Array)} */
     public extraField: Array<number>|Uint8Array;

    constructor(input: Array<number> | Uint8Array, ip: number) {
        this.input = input;
        this.offset = ip;
    }
}

export class Unzip{

    public input: Array<number> | Uint8Array;
    public ip: number;
    public eocdrOffset: number;
    public numberOfThisDisk: number;
    public startDisk: number;
    public totalEntriesThisDisk: number;
    public totalEntries: number;
    public centralDirectorySize: number;
    public centralDirectoryOffset: number;
    public commentLength: number;
    public comment: Array<number> | Uint8Array;
    public fileHeaderList: Array<FileHeader>;
    public filenameToIndex: {};
    public verify: boolean;
    public password: Array<number> | Uint8Array;
    public offset: number;
    public version: number;
    public os: number;
    public needVersion: number;
    public flags: number;
    public compression: number;
    public time: number;
    public date: number;
    public crc32: number;
    public compressedSize: number;
    public plainSize: number;
    public fileNameLength: number;
    public extraFieldLength: number;
    public fileCommentLength: number;
    public diskNumberStart: number;
    public internalFileAttributes: number;
    public externalFileAttributes: number;
    public relativeOffset: number;
    public filename: string;
    public extraField: Array<number> | Uint8Array;
    public length: number;

    public static CompressionMethod = ZlibT.Zip.CompressionMethod;
    public static FileHeaderSignature = ZlibT.Zip.FileHeaderSignature;
    public static LocalFileHeaderSignature = ZlibT.Zip.LocalFileHeaderSignature;
    public static CentralDirectorySignature = Zlib.Zip.CentralDirectorySignature;
    constructor(input: Array<number> | Uint8Array, opt_params: any) {
        opt_params = opt_params || {};
        /** @type {!(Array.<number>|Uint8Array)} */
        this.input =
          (USE_TYPEDARRAY && (input instanceof Array)) ?
          new Uint8Array(input) : input;
        /** @type {number} */
        this.ip = 0;
   
        /** @type {boolean} */
        this.verify = opt_params['verify'] || false;
        /** @type {(Array.<number>|Uint8Array)} */
        this.password = opt_params['password'];
    }
    public parse() {
        /** @type {!(Array.<number>|Uint8Array)} */
        let input = this.input;
        /** @type {number} */
        let ip = this.offset;
      
        // central file header signature
        if (input[ip++] !== Unzip.FileHeaderSignature[0] ||
            input[ip++] !== Unzip.FileHeaderSignature[1] ||
            input[ip++] !== Unzip.FileHeaderSignature[2] ||
            input[ip++] !== Unzip.FileHeaderSignature[3]) {
          throw new Error('invalid file header signature');
        }
      
        // version made by
        this.version = input[ip++];
        this.os = input[ip++];
      
        // version needed to extract
        this.needVersion = input[ip++] | (input[ip++] << 8);
      
        // general purpose bit flag
        this.flags = input[ip++] | (input[ip++] << 8);
      
        // compression method
        this.compression = input[ip++] | (input[ip++] << 8);
      
        // last mod file time
        this.time = input[ip++] | (input[ip++] << 8);
      
        //last mod file date
        this.date = input[ip++] | (input[ip++] << 8);
      
        // crc-32
        this.crc32 = (
          (input[ip++]      ) | (input[ip++] <<  8) |
          (input[ip++] << 16) | (input[ip++] << 24)
        ) >>> 0;
      
        // compressed size
        this.compressedSize = (
          (input[ip++]      ) | (input[ip++] <<  8) |
          (input[ip++] << 16) | (input[ip++] << 24)
        ) >>> 0;
      
        // uncompressed size
        this.plainSize = (
          (input[ip++]      ) | (input[ip++] <<  8) |
          (input[ip++] << 16) | (input[ip++] << 24)
        ) >>> 0;
      
        // file name length
        this.fileNameLength = input[ip++] | (input[ip++] << 8);
      
        // extra field length
        this.extraFieldLength = input[ip++] | (input[ip++] << 8);
      
        // file comment length
        this.fileCommentLength = input[ip++] | (input[ip++] << 8);
      
        // disk number start
        this.diskNumberStart = input[ip++] | (input[ip++] << 8);
      
        // internal file attributes
        this.internalFileAttributes = input[ip++] | (input[ip++] << 8);
      
        // external file attributes
        this.externalFileAttributes =
          (input[ip++]      ) | (input[ip++] <<  8) |
          (input[ip++] << 16) | (input[ip++] << 24);
      
        // relative offset of local header
        this.relativeOffset = (
          (input[ip++]      ) | (input[ip++] <<  8) |
          (input[ip++] << 16) | (input[ip++] << 24)
        ) >>> 0;
      
        // file name
        this.filename = String.fromCharCode.apply(null, USE_TYPEDARRAY ?
          (<Uint8Array>input).subarray(ip, ip += this.fileNameLength) :
          input.slice(ip, ip += this.fileNameLength)
        );
      
        // extra field
        this.extraField = USE_TYPEDARRAY ?
        (<Uint8Array>input).subarray(ip, ip += this.extraFieldLength) :
          input.slice(ip, ip += this.extraFieldLength);
      
        // file comment
        this.comment = USE_TYPEDARRAY ?
        (<Uint8Array>input).subarray(ip, ip + this.fileCommentLength) :
          input.slice(ip, ip + this.fileCommentLength);
      
        this.length = ip - this.offset;
    }
    public searchEndOfCentralDirectoryRecord() {
        /** @type {!(Array.<number>|Uint8Array)} */
        let input = this.input;
        /** @type {number} */
        let ip;
      
        for (ip = input.length - 12; ip > 0; --ip) {
          if (input[ip  ] === Unzip.CentralDirectorySignature[0] &&
              input[ip+1] === Unzip.CentralDirectorySignature[1] &&
              input[ip+2] === Unzip.CentralDirectorySignature[2] &&
              input[ip+3] === Unzip.CentralDirectorySignature[3]) {
            this.eocdrOffset = ip;
            return;
          }
        }
      
        throw new Error('End of Central Directory Record not found');
    }
    public parseEndOfCentralDirectoryRecord() {
        /** @type {!(Array.<number>|Uint8Array)} */
        let input = this.input;
        /** @type {number} */
        let ip;
      
        if (!this.eocdrOffset) {
          this.searchEndOfCentralDirectoryRecord();
        }
        ip = this.eocdrOffset;
      
        // signature
        if (input[ip++] !== Unzip.CentralDirectorySignature[0] ||
            input[ip++] !== Unzip.CentralDirectorySignature[1] ||
            input[ip++] !== Unzip.CentralDirectorySignature[2] ||
            input[ip++] !== Unzip.CentralDirectorySignature[3]) {
          throw new Error('invalid signature');
        }
      
        // number of this disk
        this.numberOfThisDisk = input[ip++] | (input[ip++] << 8);
      
        // number of the disk with the start of the central directory
        this.startDisk = input[ip++] | (input[ip++] << 8);
      
        // total number of entries in the central directory on this disk
        this.totalEntriesThisDisk = input[ip++] | (input[ip++] << 8);
      
        // total number of entries in the central directory
        this.totalEntries = input[ip++] | (input[ip++] << 8);
      
        // size of the central directory
        this.centralDirectorySize = (
          (input[ip++]      ) | (input[ip++] <<  8) |
          (input[ip++] << 16) | (input[ip++] << 24)
        ) >>> 0;
      
        // offset of start of central directory with respect to the starting disk number
        this.centralDirectoryOffset = (
          (input[ip++]      ) | (input[ip++] <<  8) |
          (input[ip++] << 16) | (input[ip++] << 24)
        ) >>> 0;
      
        // .ZIP file comment length
        this.commentLength = input[ip++] | (input[ip++] << 8);
      
        // .ZIP file comment
        this.comment = USE_TYPEDARRAY ?
          (<Uint8Array>input).subarray(ip, ip + this.commentLength) :
          input.slice(ip, ip + this.commentLength);
    }

    public parseFileHeader() {
        /** @type {Array.<Zlib.Unzip.FileHeader>} */
        let filelist = [];
        /** @type {Object.<string, number>} */
        let filetable = {};
        /** @type {number} */
        let ip;
        /** @type {Zlib.Unzip.FileHeader} */
        let fileHeader;
        /*: @type {number} */
        let i;
        /*: @type {number} */
        let il;
      
        if (this.fileHeaderList) {
          return;
        }
      
        if (this.centralDirectoryOffset === void 0) {
          this.parseEndOfCentralDirectoryRecord();
        }
        ip = this.centralDirectoryOffset;
      
        for (i = 0, il = this.totalEntries; i < il; ++i) {
          fileHeader = new FileHeader(this.input, ip);
          fileHeader.parse();
          ip += fileHeader.length;
          filelist[i] = fileHeader;
          filetable[fileHeader.filename] = i;
        }
      
        if (this.centralDirectorySize < ip - this.centralDirectoryOffset) {
          throw new Error('invalid file header size');
        }
      
        this.fileHeaderList = filelist;
        this.filenameToIndex = filetable;
    }

    public getFileData(index, opt_params) {
        opt_params = opt_params || {};
        /** @type {!(Array.<number>|Uint8Array)} */
        let input = this.input;
        /** @type {Array.<Zlib.Unzip.FileHeader>} */
        let fileHeaderList = this.fileHeaderList;
        /** @type {Zlib.Unzip.LocalFileHeader} */
        let localFileHeader;
        /** @type {number} */
        let offset;
        /** @type {number} */
        let length;
        /** @type {!(Array.<number>|Uint8Array)} */
        let buffer;
        /** @type {number} */
        let crc32;
        /** @type {Array.<number>|Uint32Array|Object} */
        let key;
        /** @type {number} */
        let i;
        /** @type {number} */
        let il;
      
        if (!fileHeaderList) {
          this.parseFileHeader();
        }
      
        if (fileHeaderList[index] === void 0) {
          throw new Error('wrong index');
        }
      
        offset = fileHeaderList[index].relativeOffset;
        localFileHeader = new LocalFileHeader(this.input, offset);
        localFileHeader.parse();
        offset += localFileHeader.length;
        length = localFileHeader.compressedSize;
      
        // decryption
        if ((localFileHeader.flags & LocalFileHeader.Flags.ENCRYPT) !== 0) {
          if (!(opt_params['password'] || this.password)) {
            throw new Error('please set password');
          }
          key =  this.createDecryptionKey(opt_params['password'] || this.password);
      
          // encryption header
          for(i = offset, il = offset + 12; i < il; ++i) {
            this.decode(key, input[i]);
          }
          offset += 12;
          length -= 12;
      
          // decryption
          for (i = offset, il = offset + length; i < il; ++i) {
            input[i] = this.decode(key, input[i]);
          }
        }
      
        switch (localFileHeader.compression) {
          case Unzip.CompressionMethod.STORE:
            buffer = USE_TYPEDARRAY ?
              (<Uint8Array>this.input).subarray(offset, offset + length) :
              this.input.slice(offset, offset + length);
            break;
          case Unzip.CompressionMethod.DEFLATE:
            buffer = new ZlibT.RawInflate(this.input, {
              'index': offset,
              'bufferSize': localFileHeader.plainSize
            }).decompress();
            break;
          default:
            throw new Error('unknown compression type');
        }
      
        if (this.verify) {
          crc32 = ZlibT.CRC32.calc(buffer);
          if (localFileHeader.crc32 !== crc32) {
            throw new Error(
              'wrong crc: file=0x' + localFileHeader.crc32.toString(16) +
              ', data=0x' + crc32.toString(16)
            );
          }
        }
      
        return buffer;
    }

    public getFilenames() {
        /** @type {Array.<string>} */
        let filenameList = [];
        /** @type {number} */
        let i;
        /** @type {number} */
        let il;
        /** @type {Array.<Zlib.Unzip.FileHeader>} */
        let fileHeaderList;
      
        if (!this.fileHeaderList) {
          this.parseFileHeader();
        }
        fileHeaderList = this.fileHeaderList;
      
        for (i = 0, il = fileHeaderList.length; i < il; ++i) {
          filenameList[i] = fileHeaderList[i].filename;
        }
      
        return filenameList;
      };

    public decompress = function(filename: string, opt_params: any) {
        /** @type {number} */
        let index;
      
        if (!this.filenameToIndex) {
          this.parseFileHeader();
        }
        index = this.filenameToIndex[filename];
      
        if (index === void 0) {
          throw new Error(filename + ' not found');
        }
      
        return this.getFileData(index, opt_params);
    }
      
      /**
       * @param {(Array.<number>|Uint8Array)} password
       */
    public setPassword(password: Array<number> | Uint8Array) {
        this.password = password;
    }

    public decode(key, n) {
        n ^= this.getByte(/** @type {(Array.<number>|Uint32Array)} */(key));
        this.updateKeys(/** @type {(Array.<number>|Uint32Array)} */(key), n);
        return n;
    };

    public updateKeys = ZlibT.Zip.updateKeys;
    public createDecryptionKey = ZlibT.Zip.createEncryptionKey;
    public getByte = ZlibT.getByte;
      
}
