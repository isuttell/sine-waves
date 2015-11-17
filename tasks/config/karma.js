/**
 * Karma Jasmine Tests
 *
 * ---------------------------------------------------------------
 *
 * For usage docs see:
 *      https://github.com/karma-runner/grunt-karma
 */
module.exports = function(grunt) {

  grunt.config.set('karma', {
    options: {
      configFile: 'tests/karma.conf.js',
      separator: ''
    },
    dev: {
      options: {
        singleRun: true,
        browsers: ['PhantomJS'],
        logLevel: 'INFO'
      }
    },
    watch: {
      options: {
        background: true,
        browsers: ['PhantomJS'],
        logLevel: 'DEBUG'
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
};
