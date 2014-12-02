/**
 * JSCS
 *
 * ---------------------------------------------------------------
 *
 * # default task config
 * Enforce Coding standards
 *
 *
 * For usage docs see:
 *      https://github.com/jscs-dev/grunt-jscs
 */
module.exports = function(grunt) {

  grunt.config.set('jscs', {
    options: {
      config: '.jscsrc'
    },
    src: {
      files: {
        src: ['src/**/*.js', '!src/lib/amd.js']
      }
    },
    specs: {
      files : {
        src: ['tests/specs/**/*.js']
      }
    },
    tasks: {
      files : {
        src: ['tasks/**/*.js']
      }
    }
  });

};
