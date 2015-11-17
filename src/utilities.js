/************************************************
 * @file  General utility functions
 * @author  Isaac Suttell
 ************************************************/

const PI180 = Math.PI / 180;

/**
 * Checks to see if a var is a speficied type
 *
 * @param  {Mixed}  obj  var to check
 * @return {Boolean}
 */
export function isType(obj, type) {
  let result = {}.toString.call(obj).toLowerCase();
  return result === '[object ' + type.toLowerCase() + ']';
}

/**
 * Checks to see if a var is a function
 *
 * @alias  isType
 * @param  {Mixed}  fn  var to check
 * @return {Boolean}
 */
export function isFunction(fn) {
  return isType(fn, 'function');
}

/**
 * Checks to see if a var is a string
 *
 * @alias  isType
 * @param  {Mixed}  str  var to check
 * @return {Boolean}
 */
export function isString(str) {
  return isType(str, 'string');
}

/**
 * Checks to see if a var is a number
 *
 * @alias  isType
 * @param  {Mixed}  num  var to check
 * @return {Boolean}
 */
export function isNumber(num) {
  return isType(num, 'number');
}

/**
 * Create a clone of an object
 *
 * @param  {Object} src Object to clone
 * @return {Object}
 */
export function shallowClone(src) {
  var dest = {};
  for (var i in src) {
    if (src.hasOwnProperty(i)) {
      dest[i] = src[i];
    }
  }
  return dest;
}

/**
 * Basic Extend Function
 *
 * @param     {Object}    dest   object to fill
 * @param     {Object}    src    object to copy
 * @return    {Object}
 */
export function defaults(dest, src) {
  if (!isType(src, 'object')) {
    src = {};
  }
  var clone = shallowClone(dest);
  for (var i in src) {
    if (src.hasOwnProperty(i)) {
      clone[i] = src[i];
    }
  }
  return clone;
}

/**
 * Convert degress to radians for rotation function
 *
 * @param     {Number}    degrees
 * @return    {Number}
 */
export function degreesToRadians(degrees) {
  if (!isType(degrees, 'number')) {
    throw new TypeError('Degrees is not a number');
  }
  return degrees * PI180;
}

/**
 * You can either directly specify a easing function, use a built in function
 * or default to the basic SineInOut
 *
 * @param     {Object}   obj     Object to search in
 * @param     {Mixed}    name    String || Function
 * @param     {String}   def     Default funciton
 * @return    {Function}
 */
export function getFn(obj, name, def) {
  if (isFunction(name)) {
    return name;
  } else if (isString(name) && isFunction(obj[name.toLowerCase()])) {
    return obj[name.toLowerCase()];
  } else {
    return obj[def];
  }
}
