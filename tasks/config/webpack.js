/**
 * Webpack
 *
 * ---------------------------------------------------------------
 *
 * Module loader, JSX transform, Minification, Sourcemaps
 *
 * For usage docs see:
 *    https://github.com/webpack/grunt-webpack
 */

var assign = require('object-assign');
var webpack = require('webpack');
var path = require('path');

module.exports = function(grunt) {

  /** **************************************************************************
   * Build
   */
  var buildOptions = assign({}, require('./webpack.config'), {
    // Clear default plugins so we can override through grunt
    plugins: []
  });

  grunt.config.set('webpack', {

    options: buildOptions,

    dev: {
      plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.DedupePlugin()
      ]
    },

    dist : {
      output: {
        filename: '[name].min.js'
      },

      plugins: [
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
      ]
    }
  });

  /** **************************************************************************
   * Development Server
   */
  var serverOptions = assign({}, require('./webpack.config'), {
    plugins: [],
    entry : {
      bundle: path.resolve(__dirname, '../../examples/index.js')
    },
    output: {
      filename: 'bundle.js'
    },
    devtool: 'eval',
    eslint: {
      failOnWarning: false
    }
  });

  grunt.config.set('webpack-dev-server', {
    options: {
      webpack: serverOptions,
      port: 8414,
      host: 'localhost',
      contentBase: 'examples/',
      publicPath: '/assets/',
      filename: 'bundle.js',
      keepalive: true,
      inline: true,
      hot: true,
      quiet: false,
      noInfo: false
    },

    dev: {}
  });

  grunt.loadNpmTasks('grunt-webpack');
};
