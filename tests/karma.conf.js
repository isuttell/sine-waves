var webpack = require('karma-webpack');

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    basePath: '../',
    files: [
      './tests/raf-polyfill.js',
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      './tests/specs/**/*-spec.js'
    ],
    plugins: [
      webpack,
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-coverage',
      'karma-story-reporter',
      'karma-html-reporter'
    ],
    browsers: ['PhantomJS'],
    preprocessors: {
      './tests/specs/**/*-spec.js': ['webpack'],
      './src/**/*.js': ['webpack']
    },
    reporters: ['story', 'coverage'],
    coverageReporter: {
      dir: './tests/coverage',
      reporters: [{
        type: 'html',
        subdir: 'html'
      }, {
        type: 'lcov',
        subdir: 'lcov'
      }]
    },
    webpack: {
      module: {
        loaders: [{
          test: /\.(jsx?|es6)$/,
          exclude: /(node_modules)/,
          loader: 'babel'
        }],
        postLoaders: [{
          test: /\.(jsx?|es6)$/,
          exclude: /(node_modules|tests)/,
          loader: 'isparta'
        }]
      }
    },
    webpackMiddleware: {
      noInfo: true
    }
  });
};
