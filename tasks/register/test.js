/**
 * CMD: lint
 *
 * ---------------------------------------------------------------
 *
 * Lint the code
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('test', [
    'eslint',
    'karma:dev'
  ]);
};
