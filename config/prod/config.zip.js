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
    target: 'node',
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new DtsBundleWebpack({
            name: 'zip',
            main: 'dist/debug/zip_unzip.d.ts',
            out: '../../dist/prod/zip.d.ts',
            outputAsModuleFolder: true
        })
    ],
    output: {
        filename: 'zip.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
