/************************************************
 * @file  Left to right easing functions
 * @author Isaac Suttell
 ************************************************/

const HALFPI = Math.PI / 2;
const PI2 = Math.PI * 2;

/**
 * Do not apply any easing
 *
 * @param  {Number} percent   where in the line are we?
 * @param  {Number} amplitude the current strength
 *
 * @return {Number}           the new strength
 */
export function linear(percent, amplitude) {
  return amplitude;
}

/**
 * Easing function to control how string each wave is from
 * left to right
 *
 * @param  {Number} percent   where in the line are we?
 * @param  {Number} amplitude the current strength
 *
 * @return {Number}           the new strength
 */
export function sinein(percent, amplitude) {
  return amplitude * (Math.sin(percent * Math.PI - HALFPI) + 1) * 0.5;
}

/**
 * Easing function to control how string each wave is from
 * left to right
 *
 * @param  {Number} percent   where in the line are we?
 * @param  {Number} amplitude the current strength
 *
 * @return {Number}           the new strength
 */
export function sineout(percent, amplitude) {
  return amplitude * (Math.sin(percent * Math.PI + HALFPI) + 1) * 0.5;
}

/**
 * Easing function to control how string each wave is from
 * left to right
 *
 * @param  {Number} percent   where in the line are we?
 * @param  {Number} amplitude the current strength
 *
 * @return {Number}           the new strength
 */
export function sineinout(percent, amplitude) {
  return amplitude * (Math.sin(percent * PI2 - HALFPI) + 1) * 0.5;
}
