const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    'users': './src/views/users.pug',
    'userEdit': './src/views/userEdit.pug',
    'userFriends': './src/views/userFriends.pug',
    'userFriendsNews': './src/views/userFriendsNews.pug',
    'userView': './src/views/userView.pug',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.pug$/,
        use: ['html-loader', 'pug-html-loader'],
      },
    ],
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/views/users.pug',
      filename: 'html/users.html', // Output HTML files to 'dist/html'
      chunks: ['users'],
    }),
    new HtmlWebpackPlugin({
      template: './src/views/userEdit.pug',
      filename: 'html/userEdit.html',
      chunks: ['userEdit'],
    }),
    new HtmlWebpackPlugin({
      template: './src/views/userFriends.pug',
      filename: 'html/userFriends.html',
      chunks: ['userFriends'],
    }),
    new HtmlWebpackPlugin({
      template: './src/views/userFriendsNews.pug',
      filename: 'html/userFriendsNews.html',
      chunks: ['userFriendsNews'],
    }),
    new HtmlWebpackPlugin({
      template: './src/views/userView.pug',
      filename: 'html/userView.html',
      chunks: ['userView'],
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),
  ],

};
