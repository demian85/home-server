const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env = {}) => {
  const prodMode = env.production || process.env.NODE_ENV === 'production';
  const mode = prodMode ? 'production' : 'development';

  console.log('Building for mode:', mode);

  return {
    mode,
    entry: './src/client/index.jsx',
    devtool: !prodMode ? 'cheap-module-eval-source-map' : 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist/client/public'),
      filename: 'bundle.js',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.css'],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: true,
                url: false,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, 'src/client/public/'),
          to: path.resolve(__dirname, 'dist/client/public/'),
        },
      ]),
      new MiniCssExtractPlugin({
        filename: 'bundle.css',
      }),
    ],
  };
};
