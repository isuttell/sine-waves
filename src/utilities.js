/* @flow */
/************************************************
 * @file  General utility functions
 * @author  Isaac Suttell
 ************************************************/

/**
 * Utilities wrapper
 *
 * @type    {Object}
 */
var Utilities = {};

/**
 * Checks to see if a var is a speficied type
 *
 * @param  {Mixed}  obj  var to check
 *
 * @return {Boolean}
 */
var isType = Utilities.isType = function(obj, type) {
  var result = {}.toString.call(obj).toLowerCase();
  return result === '[object ' + type.toLowerCase() + ']';
};

/**
 * Checks to see if a var is a function
 *
 * @alias  isType
 * @param  {Mixed}  fn  var to check
 *
 * @return {Boolean}
 */
var isFunction = Utilities.isFunction = function(fn) {
  return isType(fn, 'function');
};

/**
 * Checks to see if a var is a string
 *
 * @alias  isType
 * @param  {Mixed}  str  var to check
 *
 * @return {Boolean}
 */
var isString = Utilities.isString = function(str) {
  return isType(str, 'string');
};

/**
 * Checks to see if a var is a number
 *
 * @alias  isType
 * @param  {Mixed}  num  var to check
 *
 * @return {Boolean}
 */
var isNumber = Utilities.isNumber = function(num) {
  return isType(num, 'number');
};

/**
 * Create a clone of an object
 *
 * @param  {Object} src Object to clone
 *
 * @return {Object}
 */
var shallowClone = Utilities.shallowClone = function(src) {
  var dest = {};
  for (var i in src) {
    if (src.hasOwnProperty(i)) {
      dest[i] = src[i];
    }
  }
  return dest;
};

/**
 * Basic Extend Function
 *
 * @param     {Object}    dest   object to fill
 * @param     {Object}    src    object to copy
 *
 * @return    {Object}
 */
var defaults = Utilities.defaults = function(dest, src) {
  if (!isType(src, 'object')) { src = {}; }
  var clone = shallowClone(dest);
  for (var i in src) {
    if (src.hasOwnProperty(i)) {
      clone[i] = src[i];
    }
  }
  return clone;
};

/**
 * Convert degress to radians for rotation function
 *
 * @param     {Number}    degrees
 *
 * @return    {Number}
 */
var degreesToRadians = Utilities.degreesToRadians = function(degrees) {
  if (!isType(degrees, 'number')) {
    throw new TypeError('Degrees is not a number');
  }
  return degrees * PI180;
};

/**
 * You can either directly specify a easing function, use a built in function
 * or default to the basic SineInOut
 *
 * @param     {Object}   obj     Object to search in
 * @param     {Mixed}    name    String || Function
 * @param     {String}   def     Default funciton
 *
 * @return    {Function}
 */
var getFn = Utilities.getFn = function(obj, name, def) {
  if (isFunction(name)) {
    return name;
  } else if (isString(name) && isFunction(obj[name.toLowerCase()])) {
    return obj[name.toLowerCase()];
  } else {
    return obj[def];
  }
};
