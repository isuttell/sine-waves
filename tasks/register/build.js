/**
 * CMD: grunt
 *
 * ---------------------------------------------------------------
 *
 * Default grunt command builds the src
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('build', [
    'test',
    'clean',
    'webpack:dev',
    'webpack:dist'
  ]);
};
