/**
 * Gruntfile
 *
 * WARNING:
 * Unless you know what you're doing, you shouldn't change this file.
 * Check out the `tasks` directory instead.
 */

module.exports = function(grunt) {
  'use strict';

  // Auto load grunt tasks
  require('jit-grunt')(grunt, {
    flow: 'grunt-flow-type-check'
  });

  /**
   * Loads Grunt configuration modules from the specified
   * relative path. These modules should export a function
   * that, when run, should either load/configure or register
   * a Grunt task.
   *
   * @param   {String}   dir   Directory to load
   */
  function loadTasks(dir) {
    /**
     * Resolve any relative paths
     *
     * @type    {String}
     */
    dir = require('path').resolve(dir);

    /**
     * Interal collection of modules loaded
     *
     * @type    {Object}
     */
    var modules = {};

    /**
     * Get a list of items in a directory. This is synchronous since we're
     * only doing this once on application load
     *
     * @type    {Array}
     */
    var list = require('fs').readdirSync(dir);

    /**
     * Setup the Regex to filter out *.js files
     *
     * @type    {RegExp}
     */
    var jsFile = /.*\.js/;

    // Cycle through each item in the directory
    list.forEach(function(module) {
      //Check to see if with have a match and if we split it apartment
      module = module.match(jsFile);
      if (module) {
        // If we find a match try to load and save it. Otherwise log an error
        try {
          modules[module[0]] = require(dir + '/' + module[0]);
        } catch (err) {
          console.error('Unable to load ' + dir + '/' + module[0], err);
        }
      }
    });

    return modules;
  }

  /**
   * Invokes the function from a Grunt configuration module with
   * a single argument - the `grunt` object.
   */
  function invokeConfigFn(tasks) {
    for (var taskName in tasks) {
      if (tasks.hasOwnProperty(taskName)) {
        tasks[taskName](grunt);
      }
    }
  }

  // Load task functions
  var taskConfigurations = loadTasks('./tasks/config');
  var registerDefinitions = loadTasks('./tasks/register');

  // Run task functions to configure Grunt.
  invokeConfigFn(taskConfigurations);
  invokeConfigFn(registerDefinitions);

};
