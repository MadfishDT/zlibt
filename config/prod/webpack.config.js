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
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'zlibt.js',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, '../dist/release')
  }
};