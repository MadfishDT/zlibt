const path = require('path');
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
    target: 'web',
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'zlibt.umd.js',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, '../../dist/prod')
    }
};
