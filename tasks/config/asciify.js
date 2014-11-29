/**
 * Asciify
 *
 * ---------------------------------------------------------------
 *
 * Create a fancy banner
 *
 * For usage docs see:
 *    https://github.com/olizilla/grunt-asciify
 */
module.exports = function(grunt) {

  grunt.config.set('asciify', {
    options: {
      font: 'cyberlarge',
      log: false
    },
    title: {
      text: 'Sine Waves'
    }
  });

};
