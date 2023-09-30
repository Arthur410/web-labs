const PugPlugin = require('pug-plugin');
const { join } = require('path');

module.exports = {
  entry: {
    // define all Pug files here
    users: './src/views/users.pug',
    usersJS: './src/js/users.js',
  },

  output: {
    path: join(__dirname, 'dist/'),
    publicPath: '/',
  },

  plugins: [
    new PugPlugin({
      js: {
        // output filename of extracted JS file from source script
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS file from source style
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader,
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
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
    ],
  },
};



