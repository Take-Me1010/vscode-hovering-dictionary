//@ts-check

'use strict';

const path = require('path');
const copyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/**
 * @returns {'development' | 'production'}
 */
function getMode() {
  const argv = process.argv;
  const i = argv.indexOf('--mode');
  if (i > 0) {
    //@ts-ignore
    return argv[i+1];
  } else {
    return 'development';
  }
}

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vsceignore file
  },
  plugins: [
    new copyPlugin({
      patterns: ['win32-ia32', 'win32-x64', 'linux-x64', 'linux-arm64', 'linux-arm', 'darwin-x64+arm64'].map((kind) => ({
        from: `./node_modules/classic-level/prebuilds/${kind}`,
        to: `./prebuilds/${kind}`
      }))
    }),
    new webpack.DefinePlugin({
      DEBUG: JSON.stringify(getMode() === 'development')
    })
  ],
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  devtool: 'nosources-source-map'
};
module.exports = [extensionConfig];