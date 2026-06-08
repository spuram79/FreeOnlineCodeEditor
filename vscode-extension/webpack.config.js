const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/webview-content.ts',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'webview.js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'tsconfig.json')
        }
      }
    ]
  },
  externals: {
    vscode: 'commonjs vscode'
  }
};