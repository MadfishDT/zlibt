const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack')
module.exports = {
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
    devtool: 'source-map',
    target: 'node',
    optimization: {
        minimize: false
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new DtsBundleWebpack({
            name: 'zib',
            main: 'dist/debug/zip_unzip.d.ts',
            out: '../../dist/dev/zip.dev.d.ts'
        })
    ],
    output: {
        filename: 'zip.dev.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/dev')
    }
};
