(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /************************************************
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * @file  Constructor and animation controller
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * @author  Isaac Suttell
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ************************************************/
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.SineWaves = undefined;
	
	var _objectAssign = __webpack_require__(5);
	
	var _objectAssign2 = _interopRequireDefault(_objectAssign);
	
	var _invariant = __webpack_require__(4);
	
	var _invariant2 = _interopRequireDefault(_invariant);
	
	var _utilities = __webpack_require__(2);
	
	var util = _interopRequireWildcard(_utilities);
	
	var _waves = __webpack_require__(3);
	
	var Waves = _interopRequireWildcard(_waves);
	
	var _ease = __webpack_require__(1);
	
	var Ease = _interopRequireWildcard(_ease);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var SineWaves = exports.SineWaves = (function () {
	
	  /**
	   * Generates multiple customizable animated sines waves
	   * using a canvas element. Supports retina displays and
	   * limited mobile support
	   */
	
	  function SineWaves(options) {
	    _classCallCheck(this, SineWaves);
	
	    this.options = (0, _objectAssign2.default)({
	      speed: 10,
	      rotate: 0,
	      ease: 'Linear',
	      wavesWidth: '95%'
	    }, options);
	
	    // Save el
	    this.el = this.options.el;
	    delete this.options.el;
	    (0, _invariant2.default)(this.el, 'A node element must be supplied');
	
	    // Setup the context for reference
	    this.ctx = this.el.getContext('2d');
	
	    // Save Waves
	    this.waves = this.options.waves;
	    delete this.options.waves;
	    (0, _invariant2.default)(this.waves && this.waves.length > 0, 'At least one wave must be supplied');
	
	    // DPI
	    this.dpr = window.devicePixelRatio || 1;
	
	    // Setup canvas width/heights
	    this.updateDimensions = this.updateDimensions.bind(this);
	    this.updateDimensions();
	    window.addEventListener('resize', this.updateDimensions);
	
	    // If the user supplied a resize event or init call it
	    this.__setupUserFunctions();
	
	    // Setup Easing
	    this.easeFn = util.getFn(Ease, this.options.ease, 'linear');
	
	    // Set the canvas rotation
	    this.rotation = util.degreesToRadians(this.options.rotate);
	
	    // Should we start running?
	    if (util.isType(this.options.running, 'boolean')) {
	      this.running = this.options.running;
	    } else {
	      this.running = true;
	    }
	
	    // Assign wave functions
	    this.__setupWaveFns();
	
	    this.time = 0;
	    this.lastFrame = Date.now();
	
	    this.__loop = this.__loop.bind(this);
	    this.update = this.update.bind(this);
	
	    this.__loop();
	  }
	
	  /**
	   * Throttled animation loop
	   */
	
	  _createClass(SineWaves, [{
	    key: '__loop',
	    value: function __loop() {
	      if (this.running === true && Date.now() - this.lastFrame > 15) {
	        this.update();
	        this.lastFrame = Date.now();
	      }
	
	      window.requestAnimationFrame(this.__loop);
	    }
	  }, {
	    key: 'getDimension',
	    value: function getDimension(dimension) {
	      if (util.isNumber(this.options[dimension])) {
	        return this.options[dimension];
	      } else if (util.isFunction(this.options[dimension])) {
	        return this.options[dimension].call(this, this.el);
	      } else if (dimension === 'width') {
	        return this.el.clientWidth;
	      } else if (dimension === 'height') {
	        return this.el.clientHeight;
	      }
	    }
	
	    /**
	     * Internal resize event to make the canvas fill the screen
	     */
	
	  }, {
	    key: 'updateDimensions',
	    value: function updateDimensions() {
	      // Dimensions
	      var width = this.getDimension('width');
	      var height = this.getDimension('height');
	
	      // Apply DPR for retina devices
	      this.width = this.el.width = width * this.dpr;
	      this.height = this.el.height = height * this.dpr;
	
	      // Scale down
	      this.el.style.width = width + 'px';
	      this.el.style.height = height + 'px';
	
	      // Padding
	      this.waveWidth = SineWaves.getWaveWidth(this.options.wavesWidth, this.width);
	
	      // Center it
	      this.waveLeft = (this.width - this.waveWidth) / 2;
	
	      // Vertical center
	      this.yAxis = this.height / 2;
	    }
	
	    /**
	     * Clear the canvas so we can redraw
	     */
	
	  }, {
	    key: 'clear',
	    value: function clear() {
	      this.ctx.clearRect(0, 0, this.width, this.height);
	    }
	
	    /**
	     * Get the user wave function or one of the built in functions
	     * @private
	     */
	
	  }, {
	    key: '__setupWaveFns',
	    value: function __setupWaveFns() {
	      var index = -1;
	      var length = this.waves.length;
	      while (++index < length) {
	        this.waves[index].waveFn = util.getFn(Waves, this.waves[index].type, 'sine');
	      }
	    }
	
	    /**
	     * This updates each of the lines each loop we're running
	     *
	     * @param  {Number} time (optional) this can be called to
	     *                       manually render lines at a certian
	     *                       time.
	     */
	
	  }, {
	    key: 'update',
	    value: function update(time) {
	      this.time = this.time - 0.007;
	      if (typeof time === 'undefined') {
	        time = this.time;
	      }
	
	      var index = -1;
	      var length = this.waves.length;
	
	      // Clear Canvas
	      this.clear();
	
	      this.ctx.save();
	
	      if (this.rotation > 0) {
	        this.ctx.translate(this.width / 2, this.height / 2);
	        this.ctx.rotate(this.rotation);
	        this.ctx.translate(-this.width / 2, -this.height / 2);
	      }
	
	      // Draw each line
	      while (++index < length) {
	        var timeModifier = this.waves[index].timeModifier || 1;
	        this.drawWave(time * timeModifier, this.waves[index]);
	      }
	      this.ctx.restore();
	
	      index = void 0;
	      length = void 0;
	    }
	
	    /**
	     * Calculate the x, y coordinates of a point in a sine wave
	     *
	     * @param  {Number} time     Internal time index
	     * @param  {Number} position Pixels x poistion
	     * @param  {Object} options  Wave options
	     * @return {Object}          {x, y}
	     */
	
	  }, {
	    key: 'getPoint',
	    value: function getPoint(time, position, options) {
	      var x = time * this.options.speed + (-this.yAxis + position) / options.wavelength;
	      var y = options.waveFn.call(this, x, Waves);
	
	      // Left and Right Sine Easing
	      var amplitude = this.easeFn.call(this, position / this.waveWidth, options.amplitude);
	
	      x = position + this.waveLeft;
	      y = amplitude * y + this.yAxis;
	
	      return {
	        x: x,
	        y: y
	      };
	    }
	
	    /**
	     * Draws one line on the canvas
	     *
	     * @param  {Number} time    current internal clock time
	     * @param  {Object} options wave options
	     */
	
	  }, {
	    key: 'drawWave',
	    value: function drawWave(time, options) {
	      // Setup defaults
	      options = util.defaults(SineWaves.defaultWave, options);
	
	      // Styles
	      this.ctx.lineWidth = options.lineWidth * this.dpr;
	      this.ctx.strokeStyle = options.strokeStyle;
	      this.ctx.lineCap = 'butt';
	      this.ctx.lineJoin = 'round';
	      this.ctx.beginPath();
	
	      // Starting Line
	      this.ctx.moveTo(0, this.yAxis);
	      this.ctx.lineTo(this.waveLeft, this.yAxis);
	
	      var i;
	      var point;
	
	      for (i = 0; i < this.waveWidth; i += options.segmentLength) {
	        // Calculate where the next point is
	        point = this.getPoint(time, i, options);
	
	        // Draw to it
	        this.ctx.lineTo(point.x, point.y);
	
	        // Clean up
	        point = void 0;
	      }
	
	      // Clean  up
	      i = void 0;
	      options = void 0;
	
	      // Ending Line
	      this.ctx.lineTo(this.width, this.yAxis);
	
	      // Stroke it
	      this.ctx.stroke();
	    }
	
	    /**
	     * Sets up the user resize event and the initialize event
	    * @private
	     */
	
	  }, {
	    key: '__setupUserFunctions',
	    value: function __setupUserFunctions() {
	      // User Resize Function
	      if (util.isFunction(this.options.resizeEvent)) {
	        this.options.resizeEvent = this.options.resizeEvent.bind(this);
	        this.options.resizeEvent();
	        window.addEventListener('resize', this.options.resizeEvent);
	      }
	
	      // User initialize
	      if (util.isFunction(this.options.initialize)) {
	        this.options.initialize.call(this);
	      }
	    }
	  }]);
	
	  return SineWaves;
	})();
	
	/**
	 * Takes either pixels or percents and calculates how wide the sine
	 * waves should be
	 *
	 * @param     {Mixed}    value    0, '10px', '90%'
	 * @param     {Number}   width    Width for percentages
	 * @return    {Number}
	 */
	
	SineWaves.getWaveWidth = function (value, width) {
	  if (util.isType(value, 'number')) {
	    return value;
	  }
	
	  value = value.toString();
	  if (value.indexOf('%') > -1) {
	    value = parseFloat(value);
	    if (value > 1) {
	      value /= 100;
	    }
	    return width * value;
	  } else if (value.indexOf('px') > -1) {
	    return parseInt(value, 10);
	  }
	};
	
	/**
	 * Defaults for each line created
	 *
	 * @type {Object}
	 */
	SineWaves.defaultWave = {
	  timeModifier: 1,
	  amplitude: 50,
	  wavelength: 50,
	  segmentLength: 10,
	  lineWidth: 1,
	  strokeStyle: 'rgba(255, 255, 255, 0.2)',
	  type: 'Sine'
	};
	
	SineWaves.Waves = Waves;
	SineWaves.Ease = Ease;

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.linear = linear;
	exports.sinein = sinein;
	exports.sineout = sineout;
	exports.sineinout = sineinout;
	/************************************************
	 * @file  Left to right easing functions
	 * @author Isaac Suttell
	 ************************************************/
	
	var HALFPI = Math.PI / 2;
	var PI2 = Math.PI * 2;
	
	/**
	 * Do not apply any easing
	 *
	 * @param  {Number} percent   where in the line are we?
	 * @param  {Number} amplitude the current strength
	 *
	 * @return {Number}           the new strength
	 */
	function linear(percent, amplitude) {
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
	function sinein(percent, amplitude) {
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
	function sineout(percent, amplitude) {
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
	function sineinout(percent, amplitude) {
	  return amplitude * (Math.sin(percent * PI2 - HALFPI) + 1) * 0.5;
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isType = isType;
	exports.isFunction = isFunction;
	exports.isString = isString;
	exports.isNumber = isNumber;
	exports.shallowClone = shallowClone;
	exports.defaults = defaults;
	exports.degreesToRadians = degreesToRadians;
	exports.getFn = getFn;
	/************************************************
	 * @file  General utility functions
	 * @author  Isaac Suttell
	 ************************************************/
	
	var PI180 = Math.PI / 180;
	
	/**
	 * Checks to see if a var is a speficied type
	 *
	 * @param  {Mixed}  obj  var to check
	 * @return {Boolean}
	 */
	function isType(obj, type) {
	  var result = ({}).toString.call(obj).toLowerCase();
	  return result === '[object ' + type.toLowerCase() + ']';
	}
	
	/**
	 * Checks to see if a var is a function
	 *
	 * @alias  isType
	 * @param  {Mixed}  fn  var to check
	 * @return {Boolean}
	 */
	function isFunction(fn) {
	  return isType(fn, 'function');
	}
	
	/**
	 * Checks to see if a var is a string
	 *
	 * @alias  isType
	 * @param  {Mixed}  str  var to check
	 * @return {Boolean}
	 */
	function isString(str) {
	  return isType(str, 'string');
	}
	
	/**
	 * Checks to see if a var is a number
	 *
	 * @alias  isType
	 * @param  {Mixed}  num  var to check
	 * @return {Boolean}
	 */
	function isNumber(num) {
	  return isType(num, 'number');
	}
	
	/**
	 * Create a clone of an object
	 *
	 * @param  {Object} src Object to clone
	 * @return {Object}
	 */
	function shallowClone(src) {
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
	function defaults(dest, src) {
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
	function degreesToRadians(degrees) {
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
	function getFn(obj, name, def) {
	  if (isFunction(name)) {
	    return name;
	  } else if (isString(name) && isFunction(obj[name.toLowerCase()])) {
	    return obj[name.toLowerCase()];
	  } else {
	    return obj[def];
	  }
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.sine = sine;
	exports.sign = sign;
	exports.square = square;
	exports.sawtooth = sawtooth;
	exports.triangle = triangle;
	/************************************************
	 * @file  Sine Wave functions
	 * @author Isaac Suttell
	 ************************************************/
	
	var PI2 = Math.PI * 2;
	
	/**
	 * Default Sine Waves
	 *
	 * @param    {Number}    x
	 */
	function sine(x) {
	  return Math.sin(x);
	}
	
	/**
	 * Alias for Sine
	 *
	 * @alias
	 * @type    {Function}
	 */
	var sin = exports.sin = sine;
	
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
	function square(x) {
	  return sign(Math.sin(x * PI2));
	}
	
	/**
	 * Sawtooth Waves
	 *
	 * @param    {Number}    x
	 */
	function sawtooth(x) {
	  return (x - Math.floor(x + 0.5)) * 2;
	}
	
	/**
	 * Triangle Waves
	 *
	 * @param    {Number}    x
	 */
	function triangle(x) {
	  return Math.abs(sawtooth(x));
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */
	
	'use strict';
	
	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */
	
	var invariant = function(condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }
	
	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error(
	        'Minified exception occurred; use the non-minified dev environment ' +
	        'for the full error message and additional helpful warnings.'
	      );
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(
	        'Invariant Violation: ' +
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	    }
	
	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};
	
	module.exports = invariant;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	/* eslint-disable no-unused-vars */
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;
	
	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}
	
		return Object(val);
	}
	
	module.exports = Object.assign || function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;
	
		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);
	
			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}
	
			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}
	
		return to;
	};


/***/ },
/* 6 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }
/******/ ])
});
;
//# sourceMappingURL=SineWaves.js.map