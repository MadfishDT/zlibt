const path = require('path');

module.exports = {
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
    target: 'web',
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'gzip.umd.js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
