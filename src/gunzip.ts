import { GunzipMember } from './gunzip_member';
import { Gzip } from './gzip';
import { CRC32 } from './crc32';
import { RawInflate } from './rawinflate';
import { USE_TYPEDARRAY } from './define/typedarray/hybrid'

export class Gunzip {
    public input: Array<number> | Uint8Array;
    public ip: number;
    public member = [];
    public decompressed: boolean;

    constructor(input: Array<number> | Uint8Array) {
    this.input = input;
    this.ip = 0;
    this.member = [];
    this.decompressed = false;
  }

  public getMembers() {
    if (!this.decompressed) {
      this.decompress();
    }
    return this.member.slice();
  };

  public decompress() {
    let il = this.input.length;
  
    while (this.ip < il) {
      this.decodeMember();
    }
  
    this.decompressed = true;
    return this.concatMember();
  };
  public decodeMember() {
    /** @type {Zlib.GunzipMember} */
    let member = new GunzipMember();
    /** @type {number} */
    let isize;
    /** @type {Zlib.RawInflate} RawInflate implementation. */
    let rawinflate;
    /** @type {!(Array.<number>|Uint8Array)} inflated data. */
    let inflated;
    /** @type {number} inflate size */
    let inflen;
    /** @type {number} character code */
    let c;
    /** @type {number} character index in string. */
    let ci;
    /** @type {Array.<string>} character array. */
    let str;
    /** @type {number} modification time. */
    let mtime;
    /** @type {number} */
    let crc32;
  
    let input = this.input;
    let ip = this.ip;
  
    member.id1 = input[ip++];
    member.id2 = input[ip++];
  
    // check signature
    if (member.id1 !== 0x1f || member.id2 !== 0x8b) {
      throw new Error('invalid file signature:' + member.id1 + ',' + member.id2);
    }
  
    // check compression method
    member.cm = input[ip++];
    switch (member.cm) {
      case 8: /* XXX: use Zlib const */
        break;
      default:
        throw new Error('unknown compression method: ' + member.cm);
    }
  
    // flags
    member.flg = input[ip++];
  
    // modification time
    mtime = (input[ip++])       |
            (input[ip++] << 8)  |
            (input[ip++] << 16) |
            (input[ip++] << 24);
    member.mtime = new Date(mtime * 1000);
  
    // extra flags
    member.xfl = input[ip++];
  
    // operating system
    member.os = input[ip++];
  
    // extra
    if ((member.flg & Gzip.FlagsMask.FEXTRA) > 0) {
      member.xlen = input[ip++] | (input[ip++] << 8);
      ip = this.decodeSubField(ip, member.xlen);
    }
  
    // fname
    if ((member.flg & Gzip.FlagsMask.FNAME) > 0) {
      c = input[ip];
      for (str = [], ci = 0; c > 0;) {
        str[ci++] = String.fromCharCode(c);
        c = input[++ip];
      }
      member.name = str.join('');
    }
  
    // fcomment
    if ((member.flg & Gzip.FlagsMask.FCOMMENT) > 0) {
      c = input[ip];
      for(str = [], ci = 0; c > 0;) {
        str[ci++] = String.fromCharCode(c);
        c = input[++ip];
      }
      member.comment = str.join('');
    }
  
    // fhcrc
    if ((member.flg & Gzip.FlagsMask.FHCRC) > 0) {
      member.crc16 = CRC32.calc(input, 0, ip) & 0xffff;
      if (member.crc16 !== (input[ip++] | (input[ip++] << 8))) {
        throw new Error('invalid header crc16');
      }
    }
  
    // isize を事前に取得すると展開後のサイズが分かるため、
    // inflate処理のバッファサイズが事前に分かり、高速になる
    isize = (input[input.length - 4])       | (input[input.length - 3] << 8) |
            (input[input.length - 2] << 16) | (input[input.length - 1] << 24);
  
    // isize の妥当性チェック
    // ハフマン符号では最小 2-bit のため、最大で 1/4 になる
    // LZ77 符号では 長さと距離 2-Byte で最大 258-Byte を表現できるため、
    // 1/128 になるとする
    // ここから入力バッファの残りが isize の 512 倍以上だったら
    // サイズ指定のバッファ確保は行わない事とする
    if (input.length - ip - /* CRC-32 */4 - /* ISIZE */4 < isize * 512) {
      inflen = isize;
    }
  
    // compressed block
    rawinflate = new RawInflate(input, {'index': ip, 'bufferSize': inflen});
    member.data = inflated = rawinflate.decompress();
    ip = rawinflate.ip;
  
    // crc32
    member.crc32 = crc32 =
      ((input[ip++])       | (input[ip++] << 8) |
       (input[ip++] << 16) | (input[ip++] << 24)) >>> 0;
    if (CRC32.calc(inflated) !== crc32) {
      throw new Error('invalid CRC-32 checksum: 0x' +
          CRC32.calc(inflated).toString(16) + ' / 0x' + crc32.toString(16));
    }
  
    // input size
    member.isize = isize =
      ((input[ip++])       | (input[ip++] << 8) |
       (input[ip++] << 16) | (input[ip++] << 24)) >>> 0;
    if ((inflated.length & 0xffffffff) !== isize) {
      throw new Error('invalid input size: ' +
          (inflated.length & 0xffffffff) + ' / ' + isize);
    }
  
    this.member.push(member);
    this.ip = ip;
  }

  public decodeSubField(ip: number, length: number) {
    return ip + length;
  };

  public concatMember() {
    /** @type {Array.<Zlib.GunzipMember>} */
    let member = this.member;
    /** @type {number} */
    let i;
    /** @type {number} */
    let il;
    /** @type {number} */
    let p = 0;
    /** @type {number} */
    let size = 0;
    /** @type {!(Array.<number>|Uint8Array)} */
    let buffer;
  
    for (i = 0, il = member.length; i < il; ++i) {
      size += member[i].data.length;
    }
  
    if (USE_TYPEDARRAY) {
      buffer = new Uint8Array(size);
      for (i = 0; i < il; ++i) {
        buffer.set(member[i].data, p);
        p += member[i].data.length;
      }
    } else {
      buffer = [];
      for (i = 0; i < il; ++i) {
        buffer[i] = member[i].data;
      }
      buffer = Array.prototype.concat.apply([], buffer);
    }
  
    return buffer;
  };
}
