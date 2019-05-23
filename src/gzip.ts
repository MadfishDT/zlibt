import { USE_TYPEDARRAY } from './define/typedarray/hybrid';
import { CRC32 } from './crc32';
import { RawDeflate } from './rawdeflate';

export enum gOperatingSystem  {
    FAT,
    AMIGA,
    VMS,
    UNIX,
    VM_CMS,
    ATARI_TOS,
    HPFS,
    MACINTOSH,
    Z_SYSTEM,
    CP_M,
    TOPS_20,
    NTFS,
    QDOS,
    ACORN_RISCOS,
    UNKNOWN= 255
};

export enum gFlagsMask {
    FTEXT= 0x01,
    FHCRC= 0x02,
    FEXTRA= 0x04,
    FNAME= 0x08,
    FCOMMENT= 0x10
};

export class Gzip {

    private input: Array<number> | Uint8Array;
    private ip: number;
    private output: Array<number> | Uint8Array;
    private flags: any;
    private filename: string;
    private comment: string;
    private deflateOptions: any;
    public static OperatingSystem = gOperatingSystem;
    public static FlagsMask = gFlagsMask;

    public static DefaultBufferSize = 0x8000;

    constructor(input: Array<number> | Uint8Array, opt_params: any) {
        this.input = input;
        this.ip = 0;
        this.flags = {};
    
        if (opt_params) {
        if (opt_params['flags']) {
            this.flags = opt_params['flags'];
        }
        if (typeof opt_params['filename'] === 'string') {
            this.filename = opt_params['filename'];
        }
        if (typeof opt_params['comment'] === 'string') {
            this.comment = opt_params['comment'];
        }
        if (opt_params['deflateOptions']) {
            this.deflateOptions = opt_params['deflateOptions'];
        }
        }
        if (!this.deflateOptions) {
        this.deflateOptions = {};
        }
    }

    public compress() {
        let flg;
        let mtime;
        let crc16;
        let crc32;
        let rawdeflate;
        let c;
        let i;
        let il;
        let output =
          new (USE_TYPEDARRAY ? Uint8Array : Array)(Gzip.DefaultBufferSize);
        let op = 0;
      
        let input = this.input;
        let ip = this.ip;
        let filename = this.filename;
        let comment = this.comment;
        // check signature
        output[op++] = 0x1f;
        output[op++] = 0x8b;
      
        // check compression method
        output[op++] = 8; /* XXX: use Zlib const */
      
        // flags
        flg = 0;
        if (this.flags['fname']) {
            flg |= Gzip.FlagsMask.FNAME;
        }
        if (this.flags['fcomment']) {
            flg |= Gzip.FlagsMask.FCOMMENT;
        } 
        if (this.flags['fhcrc']) {
            flg |= Gzip.FlagsMask.FHCRC;
        }
      
        output[op++] = flg;
      
        // modification time
        mtime = (Date.now ? Date.now() : +new Date()) / 1000 | 0;
        output[op++] = mtime        & 0xff;
        output[op++] = mtime >>>  8 & 0xff;
        output[op++] = mtime >>> 16 & 0xff;
        output[op++] = mtime >>> 24 & 0xff;
      
        // extra flags
        output[op++] = 0;
      
        // operating system
        output[op++] = Gzip.OperatingSystem.UNKNOWN;
      
        // extra
        /* NOP */
      
        // fname
        if (this.flags['fname'] !== void 0) {
          for (i = 0, il = filename.length; i < il; ++i) {
            c = filename.charCodeAt(i);
            if (c > 0xff) { output[op++] = (c >>> 8) & 0xff; }
            output[op++] = c & 0xff;
          }
          output[op++] = 0; // null termination
        }
      
        // fcomment
        if (this.flags['comment']) {
          for (i = 0, il = comment.length; i < il; ++i) {
            c = comment.charCodeAt(i);
            if (c > 0xff) { output[op++] = (c >>> 8) & 0xff; }
            output[op++] = c & 0xff;
          }
          output[op++] = 0; // null termination
        }
      
        // fhcrc
        if (this.flags['fhcrc']) {
          crc16 = CRC32.calc(output, 0, op) & 0xffff;
          output[op++] = (crc16      ) & 0xff;
          output[op++] = (crc16 >>> 8) & 0xff;
        }
      
        // add compress option
        this.deflateOptions['outputBuffer'] = output;
        this.deflateOptions['outputIndex'] = op;
      
        // compress
        rawdeflate = new RawDeflate(input, this.deflateOptions);
        output = rawdeflate.compress();
        op = rawdeflate.op;
      
        // expand buffer
        if (USE_TYPEDARRAY) {
          if (op + 8 > (<Uint8Array>output).buffer.byteLength) {
            this.output = new Uint8Array(op + 8);
            this.output.set(new Uint8Array((<Uint8Array>output).buffer));
            output = this.output;
          } else {
            output = new Uint8Array((<Uint8Array>output).buffer);
          }
        }
      
        // crc32
        crc32 = CRC32.calc(input);
        output[op++] = (crc32       ) & 0xff;
        output[op++] = (crc32 >>>  8) & 0xff;
        output[op++] = (crc32 >>> 16) & 0xff;
        output[op++] = (crc32 >>> 24) & 0xff;
      
        // input size
        il = input.length;
        output[op++] = (il       ) & 0xff;
        output[op++] = (il >>>  8) & 0xff;
        output[op++] = (il >>> 16) & 0xff;
        output[op++] = (il >>> 24) & 0xff;
      
        this.ip = ip;
      
        if (USE_TYPEDARRAY && op < output.length) {
          this.output = output = (<Uint8Array>output).subarray(0, op);
        }
      
        return output;
    }
}
