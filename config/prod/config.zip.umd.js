const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack')

module.exports = {
    mode: 'production',
    entry: './src/zip_unzip.ts',
    module: {
        rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }
        ]
    },
    target: 'web',
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'zip.umd.js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
