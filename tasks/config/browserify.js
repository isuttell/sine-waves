/**
 * Grunt task for node-browserify
 *
 * ---------------------------------------------------------------
 *
 * For usage docs see:
 *    https://github.com/jmreidy/grunt-browserify
 */
module.exports = function(grunt) {

  grunt.config.set('browserify', {
    dev: {
      src: 'src/sine-waves.js',
      dest: 'sine-waves.js'
    },
  });

};
