/**
 * CMD: grunt hint:tasks
 *
 * ---------------------------------------------------------------
 *
 * Runs jshint, js coding stands on grunt tasks
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('hint:tasks', [
    'jshint:tasks',
    'jscs:tasks'
  ]);
};
