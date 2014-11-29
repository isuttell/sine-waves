/**
 * CMD: grunt
 *
 * ---------------------------------------------------------------
 *
 * The default command starts a karma watch server and then runs any tests
 * when the the main js file changes or any test specs change
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('default', [
    'karma:watch:start',
    'flow:watch:start',
    'watch'
  ]);
};
