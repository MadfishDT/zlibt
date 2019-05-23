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
        minimize: true
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new DtsBundleWebpack({
            name: 'zib',
            main: 'dist/debug/zip_unzip.d.ts',
            out: '../../dist/dev/zip.d.ts'
        })
    ],
    output: {
        filename: 'zip.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
