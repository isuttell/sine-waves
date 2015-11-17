/**
 * CMD: server
 *
 * ---------------------------------------------------------------
 *
 * Runs a devlopement server available at http://localhost:8080
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('server', [
    'webpack-dev-server'
  ]);
};
