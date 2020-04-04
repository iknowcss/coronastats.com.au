const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'production';
const xxx = {
  development: {
    outputPath: path.resolve(__dirname, './dist'),
    outputPublicPath: '',
    htmlOutputFilename: 'index.html',
    copyOutput: '',
  },
  production: {
    outputPath: path.resolve(__dirname, './dist/assets'),
    outputPublicPath: 'assets',
    htmlOutputFilename: '../index.html',
    copyOutput: '../',
  },
};

module.exports = {
  context: __dirname,
  entry: './src/index.js',
  output: {
    path: xxx[nodeEnv].outputPath,
    publicPath: xxx[nodeEnv].outputPublicPath,
    filename: 'index.[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: [{ loader: 'html-loader' }]
      },
      {
        test: /\.s?css$/i,
        exclude: /node_modules/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: xxx[nodeEnv].htmlOutputFilename,
    }),
    new MiniCssExtractPlugin({
      filename: 'index.[contenthash].css',
      hmr: nodeEnv === 'development',
      reloadAll: true,
    }),
    new CopyPlugin([
      {
        from: 'static/',
        to: xxx[nodeEnv].copyOutput,
      },
    ]),
  ]
};
