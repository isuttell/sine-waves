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
Waves.Sine = function(x) {
  return Math.sin(x);
};

/**
 * Sign polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
 *
 * @param     {Number}    x
 *
 * @return    {Number}
 */
function sign(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
}

/**
 * Square Waves
 *
 * @param    {Number}    x
 */
Waves.Square = function(x) {
  return sign(Math.sin(x * PI2));
};

/**
 * Sawtooth Waves
 *
 * @param    {Number}    x
 */
Waves.Sawtooth = function(x) {
  return (x - Math.floor(x + 0.5)) * 2;
};

/**
 * Triangle Waves
 *
 * @param    {Number}    x
 */
Waves.Triangle = function(x) {
  return Math.abs(Waves.Sawtooth(x));
};
