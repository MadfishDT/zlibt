const path = require('path');

module.exports = {
    mode: 'production',
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
    target: 'web',
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'raw.umd.js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
