const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack');

module.exports = {
    mode: 'production',
    entry: './src/flate.ts',
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
            name: 'flate',
            main: 'dist/debug/flate.d.ts',
            out: '../../dist/prod/flate.d.ts',
            outputAsModuleFolder: true
        })
    ],
    output: {
        filename: 'flate.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
