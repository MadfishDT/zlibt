const path = require('path');

module.exports = {
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
    devtool: 'source-map',
    target: 'node',
    optimization: {
        minimize: false
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'zlibt.dev.js',
        path: path.resolve(__dirname, '../dist/dev')
    }
};