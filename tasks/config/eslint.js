/**
 * eslint
 *
 * ---------------------------------------------------------------
 *
 * # Lints js, jsx, and es6
 *
 * For usage docs see:
 *      https://github.com/sindresorhus/grunt-eslint
 */
module.exports = function(grunt) {
  grunt.config.set('eslint', {
    target: ['src/**/*.js'],
    options: {
      maxWarnings: 0
    }
  });

  grunt.loadNpmTasks('grunt-eslint');
};
