const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack');

module.exports = {
    mode: 'production',
    entry: './src/gzip_gunzip.ts',
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
          name: 'gzip',
          main: 'dist/debug/gzip_gunzip.d.ts',
          out: '../../dist/prod/gzip.d.ts',
          outputAsModuleFolder: true
        })
    ],
    output: {
        filename: 'gzip.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
