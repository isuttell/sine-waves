/**
 * CMD: grunt build
 *
 * ---------------------------------------------------------------
 *
 * Runs all the tests to ensure everything is working as intended
 * and then minifies the main js file.
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('build', [
    'test',
    'asciify',
    'concat',
    'jshint:build', // run on the concated file
    'uglify'
  ]);
};
