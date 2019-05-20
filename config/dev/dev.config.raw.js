const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack');
module.exports = {
    entry: './src/raw.ts',
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
            name: 'raw',
            main: 'dist/debug/raw.d.ts',
            out: '../../dist/dev/raw.dev.d.ts'
        })
    ],
    output: {
        filename: 'raw.dev.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/dev')
    }
};
