/**
 * CMD: grunt hint
 *
 * ---------------------------------------------------------------
 *
 * Runs jshint, js coding stands and js validate to ensure general
 * code integrity
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('hint', [
    'jscs',
    'jshint'
  ]);
};
