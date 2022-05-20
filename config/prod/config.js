const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack');
module.exports = {
    mode: 'production',
    entry: './src/zlibt.ts',
    module: {
        rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }
        ]
    },
    target: 'node',
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new DtsBundleWebpack({
            name: 'zlibt',
            main: 'dist/debug/zlibt.d.ts',
            out: '../../dist/prod/zlibt.d.ts',
            outputAsModuleFolder: true
        })
    ],
    output: {
        filename: 'zlibt.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
