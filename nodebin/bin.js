#! /usr/bin/env node
const Zlib = require('../zlib_and_gzip.min').Zlib;
const fs = require('fs');
const path =require('path');

const argv = process.argv;
/**
 * zlibt compress aws.js aws.z
 */

function compress(input) {
    const deflate = new Zlib.Deflate(input, null);
    const compress = deflate.compress();

    return compress;

}

function uncompress(input) {
    const inflate = new Zlib.Inflate(input, null);
    const plain = inflate.decompress();
    return plain;
}

function main() {

    if(argv.length < 4) {
        console.log('not enough parameters');
        return false;
    }
    
    let command = argv[2];
    let inputFile = argv[3];
    let outFile = argv[4];

    let inputPathResolve = path.resolve(inputFile);
    let outPathResolve = path.resolve(outFile);

    let readBuffer = null;
    if(fs.existsSync(inputPathResolve)) {
        console.log(`read input files ${inputPathResolve}`);
        readBuffer = fs.readFileSync(inputPathResolve);
    }
    let outBuffer = null;
    if(command.toLowerCase() == 'c') {
        outBuffer = compress(readBuffer);
    } else if(command.toLowerCase() == 'u') {
        outBuffer = uncompress(readBuffer);
    } else {
        console.log('not support command');
        return;
    }
    fs.writeFileSync(outPathResolve,outBuffer);

}
main();
