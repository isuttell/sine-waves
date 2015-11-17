/**
 * Clean
 *
 * ---------------------------------------------------------------
 *
 * # Cleans up build folders to ensure nothing is left over from a previous build
 *
 * For usage docs see:
 *      https://github.com/gruntjs/grunt-contrib-clean
 */
module.exports = function(grunt) {
  grunt.config.set('clean', {
    target: ['dist/*']
  });
  grunt.loadNpmTasks('grunt-contrib-clean');
};
