const path = require('path');
const TypescriptDeclarationPlugin = require('typescript-declaration-webpack-plugin');
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
    plugins: [
        new TypescriptDeclarationPlugin({
          out: 'zlibt.dev.d.ts'
        })
    ],
    output: {
        filename: 'zlibt.dev.js',
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '../../dist/dev')
    }
};
