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