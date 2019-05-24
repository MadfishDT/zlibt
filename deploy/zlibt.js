const fs = require('fs');
const path = require('path');

let declareFilePath = path.resolve(__dirname, '../dist/prod/zlibt.d.ts');
let sourceFilePath = path.resolve(__dirname, '../dist/prod/zlibt.js');
let sourceUmdFilePath = path.resolve(__dirname, '../dist/prod/zlibt.umd.js');

let declareFileTargetPath = path.resolve(__dirname, '../npms/zlibt/zlibt.d.ts');
let sourceFileTargetPath = path.resolve(__dirname, '../npms/zlibt/zlibt.js');
let sourceUmdFileTargetPath = path.resolve(__dirname, '../npms/zlibt/zlibt.umd.js');

fs.copyFile(declareFilePath, declareFileTargetPath, (err) => {
  if (err) throw err;
});

fs.copyFile(sourceFilePath, sourceFileTargetPath, (err) => {
    if (err) throw err;
});

fs.copyFile(sourceUmdFilePath, sourceUmdFileTargetPath, (err) => {
    if (err) throw err;
});


declareFilePath = path.resolve(__dirname, '../dist/prod/flate.d.ts');
sourceFilePath = path.resolve(__dirname, '../dist/prod/flate.js');
sourceUmdFilePath = path.resolve(__dirname, '../dist/prod/flate.umd.js');

declareFileTargetPath = path.resolve(__dirname, '../npms/zlibt/flate.d.ts');
sourceFileTargetPath = path.resolve(__dirname, '../npms/zlibt/flate.js');
sourceUmdFileTargetPath = path.resolve(__dirname, '../npms/zlibt/flate.umd.js');

fs.copyFile(declareFilePath, declareFileTargetPath, (err) => {
  if (err) throw err;
});

fs.copyFile(sourceFilePath, sourceFileTargetPath, (err) => {
    if (err) throw err;
});

fs.copyFile(sourceUmdFilePath, sourceUmdFileTargetPath, (err) => {
    if (err) throw err;
});


declareFilePath = path.resolve(__dirname, '../dist/prod/gzip.d.ts');
sourceFilePath = path.resolve(__dirname, '../dist/prod/gzip.js');
sourceUmdFilePath = path.resolve(__dirname, '../dist/prod/gzip.umd.js');

declareFileTargetPath = path.resolve(__dirname, '../npms/zlibt/gzip.d.ts');
sourceFileTargetPath = path.resolve(__dirname, '../npms/zlibt/gzip.js');
sourceUmdFileTargetPath = path.resolve(__dirname, '../npms/zlibt/gzip.umd.js');

fs.copyFile(declareFilePath, declareFileTargetPath, (err) => {
  if (err) throw err;
});

fs.copyFile(sourceFilePath, sourceFileTargetPath, (err) => {
    if (err) throw err;
});

fs.copyFile(sourceUmdFilePath, sourceUmdFileTargetPath, (err) => {
    if (err) throw err;
});


declareFilePath = path.resolve(__dirname, '../dist/prod/raw.d.ts');
sourceFilePath = path.resolve(__dirname, '../dist/prod/raw.js');
sourceUmdFilePath = path.resolve(__dirname, '../dist/prod/raw.umd.js');

declareFileTargetPath = path.resolve(__dirname, '../npms/zlibt/raw.d.ts');
sourceFileTargetPath = path.resolve(__dirname, '../npms/zlibt/raw.js');
sourceUmdFileTargetPath = path.resolve(__dirname, '../npms/zlibt/raw.umd.js');

fs.copyFile(declareFilePath, declareFileTargetPath, (err) => {
  if (err) throw err;
});

fs.copyFile(sourceFilePath, sourceFileTargetPath, (err) => {
    if (err) throw err;
});

fs.copyFile(sourceUmdFilePath, sourceUmdFileTargetPath, (err) => {
    if (err) throw err;
});


declareFilePath = path.resolve(__dirname, '../dist/prod/zip.d.ts');
sourceFilePath = path.resolve(__dirname, '../dist/prod/zip.js');
sourceUmdFilePath = path.resolve(__dirname, '../dist/prod/zip.umd.js');

declareFileTargetPath = path.resolve(__dirname, '../npms/zlibt/zip.d.ts');
sourceFileTargetPath = path.resolve(__dirname, '../npms/zlibt/zip.js');
sourceUmdFileTargetPath = path.resolve(__dirname, '../npms/zlibt/zip.umd.js');

fs.copyFile(declareFilePath, declareFileTargetPath, (err) => {
  if (err) throw err;
});

fs.copyFile(sourceFilePath, sourceFileTargetPath, (err) => {
    if (err) throw err;
});

fs.copyFile(sourceUmdFilePath, sourceUmdFileTargetPath, (err) => {
    if (err) throw err;
});