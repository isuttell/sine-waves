/**
 * CMD: grunt
 *
 * ---------------------------------------------------------------
 *
 * Default grunt command builds the src
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('default', [
    'webpack:watch'
  ]);
};
