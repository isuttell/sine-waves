/**
 * CMD: grunt hint:specs
 *
 * ---------------------------------------------------------------
 *
 * Runs jshint, js coding stands on test specs
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('hint:specs', [
    'jshint:specs',
    'jscs:specs'
  ]);
};
