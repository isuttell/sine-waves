module.exports = function(config) {
  'use strict';

  config.set({

    basePath: '../',

    files: [
      'tests/vendor/**/*.js',
      'src/**/*.js',
      'tests/specs/**/*.js',
    ],

    autoWatch: false,

    frameworks: ['jasmine', 'browserify'],

    preprocessors: {
      'tests/specs/**/*.js': ['browserify'],
      'src/**/*.js': ['browserify'],
    },

    browsers: ['PhantomJS'],

    plugins: [
      'karma-browserify',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-coverage',
      'karma-story-reporter',
      'karma-html-reporter'
    ],

    browserify: {
      debug: true,
      transform: ["browserify-istanbul"]
    },

    coverageReporter: {
      dir: 'tests/coverage/',
      reporters: [{
        type: 'html',
        subdir: 'html'
      }, {
        type: 'lcovonly',
        subdir: 'lcov'
      }, {
        type: 'text-summary'
      }]
    },

    htmlReporter: {
      outputDir: 'tests/results/',
      templatePath: __dirname + '/reportTemplate.html'
    },

    reporters: ['story', 'html', 'coverage']

  });
};
