/**
 * Flow
 *
 * ---------------------------------------------------------------
 *
 * Flow type checking
 *
 * For usage docs see:
 *    https://github.com/isuttell/grunt-flow-type-check
 */
module.exports = function(grunt) {

  grunt.config.set('flow', {
    options: {
      lib: 'lib/'
    },
    src: {
      options: {
        background: false,
        stripRoot: true,
        profile: true
      },
      src: '.'
    },
    single: {
      options: {
        background: false,
        stripRoot: true,
        profile: true
      },
      files: {
        src: ['src/**/*.js']
      }
    },
    watch: {
      options: {
        background: true
      },
      src: '.'
    }
  });

};
