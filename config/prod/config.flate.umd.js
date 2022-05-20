const path = require('path');

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
    target: 'web',
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'flate.umd.js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
