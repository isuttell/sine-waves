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
      configFile: '.'
    },
    single: {
      options: {
        background: false,
      }
    },
    watch: {
      options: {
        background: true
      }
    }
  });

};
