
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
    public filenameToIndex: Map<string, number>;
    public verify: boolean;
    public password: Array<number> | Uint8Array;

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
} 