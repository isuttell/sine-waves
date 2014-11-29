/**
 * Lint JS
 *
 * ---------------------------------------------------------------
 *
 * # dev task config
 * Lint JS Files
 *
 *
 * For usage docs see:
 *      https://github.com/gruntjs/grunt-contrib-jshint
 */
module.exports = function(grunt) {

  grunt.config.set('jshint', {
    options: {
      jshintrc: true
    },
    src: {
      files: {
        src: ['sine-waves.js']
      }
    }
  });

};
