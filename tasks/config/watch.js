/**
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * ---------------------------------------------------------------
 *
 * Watch for changes on
 * - files in the `assets` folder
 * and re-run the appropriate tasks.
 *
 * For usage docs see:
 *      https://github.com/gruntjs/grunt-contrib-watch
 *
 */
module.exports = function(grunt) {

  grunt.config.set('watch', {
    options: {
      interrupt: true, // Interrupt any running tasks on save
    },

    src: {
      files: ['src/**/*.js', 'tests/specs/**/*.js'],
      tasks: ['asciify', 'concat', 'karma:watch:run', 'jshint:src', 'jscs:src', 'flow:watch:status']
    },

    grunt: {
      // Grunt Files
      files: ['Gruntfile.js', 'tasks/**/*.js'],

      // Automatically reload Grunt configuration
      options: {
        reload: true
      }
    },

  });

};
