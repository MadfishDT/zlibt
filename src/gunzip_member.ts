export class GunzipMember {
    public id1: number;
    public id2: number;
    public cm: number;
    public flg: number;
    public mtime: Date;
    public xfl: number;
    public os: number;
    public crc16: number;
    public xlen: number;
    public crc32: number;
    public isize: number;
    public name: string;
    public comment: string;
    public data: Uint8Array|Array<number>;

    public getName() {
        return this.name;
    }

    public getData() {
        return this.data;
    }
    public getMtime() {
        return this.mtime;
    }
}
