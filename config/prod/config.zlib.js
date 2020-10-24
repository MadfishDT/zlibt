const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack')

module.exports = {
    entry: './src/zlib.ts',
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
            name: 'zlib.prod',
            main: '../../dist/debug/zlib.d.ts'
        })
    ],
    output: {
        filename: 'zlib.dev.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/dev')
    }
};
