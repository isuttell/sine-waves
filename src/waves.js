/************************************************
 * @file  Sine Wave functions
 * @author Isaac Suttell
 ************************************************/

const PI2 = Math.PI * 2;

/**
 * Default Sine Waves
 *
 * @param    {Number}    x
 */
export function sine(x) {
  return Math.sin(x);
}

/**
 * Alias for Sine
 *
 * @alias
 * @type    {Function}
 */
export var sin = sine;

/**
 * Sign polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
 *
 * @param     {Number}    x
 *
 * @return    {Number}
 */
export function sign(x) {
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
export function square(x) {
  return sign(Math.sin(x * PI2));
}

/**
 * Sawtooth Waves
 *
 * @param    {Number}    x
 */
export function sawtooth(x) {
  return (x - Math.floor(x + 0.5)) * 2;
}

/**
 * Triangle Waves
 *
 * @param    {Number}    x
 */
export function triangle(x) {
  return Math.abs(sawtooth(x));
}
