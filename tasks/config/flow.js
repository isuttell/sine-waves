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
      lib: './lib'
    },
    single: {
      options: {
        background: false,
        stripRoot: true,
        profile: true
      },
      src: '.'
    },
    watch: {
      options: {
        background: true
      },
      src: '.'
    }
  });

};
