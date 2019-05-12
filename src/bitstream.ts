import { USE_TYPEDARRAY } from './define/typedarray/hybrid';

export class BitStream {
    public static DefaultBlockSize = 0x8000;
    private index: number;
    private bitindex: number;
    private buffer: any;
    public static ReverseTable: Uint8Array | any[];

    constructor(buffer: Uint8Array | Array<any>, bufferPosition: number) {
        BitStream.ReverseTable = this.getReverseTable();
        this.index = typeof bufferPosition === 'number' ? bufferPosition : 0;
        this.bitindex = 0;
        this.buffer = buffer instanceof (USE_TYPEDARRAY ? Uint8Array : Array) ?
          buffer :
          new (USE_TYPEDARRAY ? Uint8Array : Array)(BitStream.DefaultBlockSize);
      
        if (this.buffer.length * 2 <= this.index) {
          throw new Error('invalid index');
        } else if (this.buffer.length <= this.index) {
          this.expandBuffer();
        }
    }

    public expandBuffer() {
        let oldbuf = this.buffer;
        let i = 0;
        let il = oldbuf.length;
        // copy buffer
        if(USE_TYPEDARRAY) {
            let uint8Buffer = new Uint8Array(il << 1);
            uint8Buffer.set(oldbuf);
            return (this.buffer = uint8Buffer); 
        } else {
            let arrayBuffer = new Array(il << 1);
            for (i = 0; i < il; ++i) {
                arrayBuffer[i] = oldbuf[i];
            }
            return (this.buffer = arrayBuffer);
        }
      }

    public writeBits(number: number, n: number, reverse?: boolean) {
        let buffer = this.buffer;
        let index = this.index;
        let bitindex =this.bitindex;

        let current = buffer[index];
        let i;

        const rev32_ = ( num: number) => {
            return (BitStream.ReverseTable[num & 0xFF] << 24) |
            (BitStream.ReverseTable[num >>> 8 & 0xFF] << 16) |
            (BitStream.ReverseTable[num >>> 16 & 0xFF] << 8) |
            BitStream.ReverseTable[num >>> 24 & 0xFF];
        }

        if (reverse && n > 1) {
            number = n > 8 ?
            rev32_(number) >> (32 - n) :
            BitStream.ReverseTable[number] >> (8 - n);
        }

        if (n + bitindex < 8) {
            current = (current << n) | number;
            bitindex += n;
        } else {
            for (i = 0; i < n; ++i){
            current = (current << 1) | ((number >> n - i - 1) & 1);

            // next byte
            if (++bitindex === 8) {
                bitindex = 0;
                buffer[index++] = BitStream.ReverseTable[current];
                current = 0;

                // expand
                if (index === buffer.length) {
                buffer = this.expandBuffer();
                }
            }
            }
        }
        buffer[index] = current;
        this.buffer = buffer;
        this.bitindex = bitindex;
        this.index = index;
    }
   
    public finish () {
        let buffer = this.buffer;
        let index = this.index;
        let output: any = null;
        
        if (this.bitindex > 0) {
                buffer[index] <<= 8 - this.bitindex;
                buffer[index] = BitStream.ReverseTable[buffer[index]];
                index++;
        }
        // array truncation
        if (USE_TYPEDARRAY) {
            output = buffer.subarray(0, index);
        } else {
            buffer.length = index;
                output = buffer;
        }
        return output;
    }
    private getReverseTable() {
        let table = new (USE_TYPEDARRAY ? Uint8Array : Array)(256);
        let i = 0;
           
        for (; i < 256; ++i) {
            table[i] = ((n) => {
                let r = n;
                let s = 7;
                for (n >>>= 1; n; n >>>= 1) {
                    r <<= 1;
                    r |= n & 1;
                    --s;
                }
                return (r << s & 0xff) >>> 0;
            })(i);
        }
        return table;
    }
}
