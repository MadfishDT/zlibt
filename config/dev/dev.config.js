const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack')
module.exports = {
    entry: './src/zlibt.ts',
    mode: 'development',
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
            name: 'zlibt',
            main: 'dist/debug/zlibt.d.ts',
            out: '../../dist/dev/zlibt.dev.d.ts'
        })
    ],
    output: {
        filename: 'zlibt.dev.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/dev')
    }
};
