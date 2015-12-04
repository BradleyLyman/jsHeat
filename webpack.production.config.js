var path                 = require('path'),
    node_modules         = path.resolve(__dirname, 'node_modules'),
    HtmlWebpackPlugin    = require('html-webpack-plugin');

module.exports = {
  entry  : [path.resolve(__dirname, 'app/main.js')],
  resolve : {
    alias : {
    }
  },
  output : {
    path     : path.resolve(__dirname, 'dist'),
    filename : 'bundle.js',
  },
  module : {
    loaders : [{
        test   : /\.css$/,
        loader : 'style!css'
      }, {
        test   : /\.woff$/,
        loader : 'url?limit=100000'
      }, {
        test   : /\.woff2$/,
        loader : 'url?limit=100000'
      }, {
        test   : /\.ttf$/,
        loader : 'url?limit=100000'
      }, {
        test   : /\.svg$/,
        loader : 'url?limit=100000'
      }, {
        test   : /\.eot$/,
        loader : 'url?limit=100000'
      },
    ]
  },
  plugins : [
    new HtmlWebpackPlugin({
      title    : 'React and Three',
      template : './app/index.html',
      inject   : 'body'
    })
  ]
};
