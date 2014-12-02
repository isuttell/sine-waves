/* @flow */
/************************************************
 * @file  Sine Wave functions
 * @author Isaac Suttell
 ************************************************/

/**
 * Holds the different types of waves
 *
 * @type    {Object}
 */
var Waves = {};

/**
 * Default Sine Waves
 *
 * @param    {Number}    x
 */
Waves.sine = function(x) {
  return Math.sin(x);
};

/**
 * Alias for Sine
 *
 * @alias
 * @type    {Function}
 */
Waves.sin = Waves.sine;

/**
 * Sign polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
 *
 * @param     {Number}    x
 *
 * @return    {Number}
 */
Waves.sign = function(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
};

/**
 * Square Waves
 *
 * @param    {Number}    x
 */
Waves.square = function(x) {
  return Waves.sign(Math.sin(x * PI2));
};

/**
 * Sawtooth Waves
 *
 * @param    {Number}    x
 */
Waves.sawtooth = function(x) {
  return (x - Math.floor(x + 0.5)) * 2;
};

/**
 * Triangle Waves
 *
 * @param    {Number}    x
 */
Waves.triangle = function(x) {
  return Math.abs(Waves.sawtooth(x));
};
