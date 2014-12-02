/* @flow */
/************************************************
 * @file  Polyfills for older browsers
 * @author  Isaac Suttell
 ************************************************/

/**
 * Bind polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 */
/* istanbul ignore next */
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs = Array.prototype.slice.call(arguments, 1);
    var fToBind = this;
    var fNOP = function() {};
    var fBound = function() {
      return fToBind.apply(this instanceof fNOP &&
        oThis ? this : oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
    };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP(); // jshint ignore:line

    return fBound;
  };
}

/**
 * Request Animation Polyfill
 * https://gist.github.com/paulirish/1579671
 *
 * @type {Array}
 */
/* istanbul ignore next */
var vendors = ['ms', 'moz', 'webkit', 'o'];
/* istanbul ignore next */
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
  window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
  window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
    window[vendors[x] + 'CancelRequestAnimationFrame'];
}

/* istanbul ignore next */
if (!window.requestAnimationFrame) {
  var lastFrameTime = 0;
  window.requestAnimationFrame = function(callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastFrameTime));
    var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      },
      timeToCall);
    lastFrameTime = currTime + timeToCall;
    return id;
  };
}

/* istanbul ignore next */
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
}
