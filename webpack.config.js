const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const dev = process.env.NODE_ENV === 'development';

const config = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/client/index.js',
  devtool: dev ? 'cheap-module-eval-source-map' : 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist/client/public'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css']
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          dev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/client/public/global.css'),
        to: path.resolve(__dirname, 'dist/client/public/global.css')
      }
    ]),
    new MiniCssExtractPlugin({
      filename: 'bundle.css'
    })
  ],
};

module.exports = config;
