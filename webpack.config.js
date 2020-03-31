const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist/'),
    publicPath: '',
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
    new HtmlWebPackPlugin({ template: './src/index.html' }),
    new MiniCssExtractPlugin({
      filename: 'index.[contenthash].css',
      hmr: process.env.NODE_ENV === 'development',
      reloadAll: true,
    }),
    new CopyPlugin([
      {
        from: 'static/',
        to: '',
      },
      {
        from: 'src/data',
        to: 'data',
      }
    ]),
  ]
};
