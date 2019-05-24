const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack')

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
    target: 'node',
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new DtsBundleWebpack({
            name: 'raw',
            main: 'dist/debug/raw.d.ts',
            out: '../../dist/prod/raw.d.ts',
            outputAsModuleFolder: true
        })
    ],
    output: {
        filename: 'raw.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
