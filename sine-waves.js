/* @flow weak */
/*
 _______ _____ __   _ _______      _  _  _ _______ _    _ _______ _______
 |______   |   | \  | |______      |  |  | |_____|  \  /  |______ |______
 ______| __|__ |  \_| |______      |__|__| |     |   \/   |______ ______|

 https://github.com/isuttell/sine-waves
 Contributor(s): Isaac Suttell <isaac@isaacsuttell.com>
 */

(function(root, factory) {
  'use strict';
  /* istanbul ignore next */
  if (typeof define === 'function' && typeof define.amd === 'object') {
    define([], function() {
      return factory(root);
    });
  } else {
    root.SineWaves = factory(root);
  }
})(this, function() {
  'use strict';

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

  /**
   * Checks to see if a var is a speficied type
   *
   * @param  {Mixed}  obj  var to check
   *
   * @return {Boolean}
   */
  var isType = function(obj, type) {
    var result = {}.toString.call(obj).toLowerCase();
    return result === '[object ' +  type.toLowerCase() + ']';
  };

  /**
   * Basic Extend Function
   *
   * @param     {Object}    dest   object to fill
   * @param     {Object}    src    object to copy
   *
   * @return    {Object}
   */
  function extend(dest, src) {
    for (var i in src) {
      if (src.hasOwnProperty(i)) {
        dest[i] = src[i];
      }
    }
    return dest;
  }

  /**
   * Generates multiple customizable animated sines waves
   * using a canvas element. Supports retina displays and
   * limited mobile support
   */
  function SineWaves(options) {
    // Save a reference
    extend(this.options, options || {});

    // Make sure we have a cancas
    this.el = this.options.el;
    if (!this.el) { throw 'No Canvas Selected'; }

    // Setup the context for reference
    this.ctx = this.el.getContext('2d');

    // Do we have any waves
    this.waves = this.options.waves;
    if (!this.waves || !this.waves.length) { throw 'No waves specified'; }

    this.dpr = window.devicePixelRatio || 1;

    // Setup canvas width/heights
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));

    // If the user supplied a resize event or init call it
    this.setupUserFunctions();

    // Set the speed
    this.speed = this.options.speed;

    // Start the magic
    this.loop();
  }

  SineWaves.prototype.setupUserFunctions = function() {
    // User Resize Function
    if (isType(this.options.resizeEvent, 'function')) {
      this.options.resizeEvent.call(this);
      window.addEventListener('resize', this.options.resizeEvent.bind(this));
    }

    // User initialize
    if (isType(this.options.initialize, 'function')) {
      this.options.initialize.call(this);
    }
  };

  /**
   * Default Options
   *
   * @type {Object}
   */
  SineWaves.prototype.options = {
    speed: 10
  };

  /**
   * This stores each wave and is filled by the user
   *
   * @type {Array}
   */
  SineWaves.prototype.waves = [];

  /**
   * Default speed of all of the waves.
   *
   * @type {Number}
   */
  SineWaves.prototype.speed = 10;

  /**
   * Defaults for each line created
   *
   * @type {Object}
   */
  SineWaves.prototype.defaultWave = {
    timeModifier: 1,
    amplitude: 50,
    wavelength: 50,
    segmentLength: 10,
    lineWidth: 1,
    strokeStyle: 'rgba(255, 255, 255, 0.2)'
  };

  /**
   * Internal resize event to make the canvas fill the screen
   */
  SineWaves.prototype.updateDimensions = function() {
    var width;
    var height;

    // Width
    if (isType(this.options.width, 'number')) {
      width = this.options.width;
    } else if (isType(this.options.width, 'function')) {
      width = this.options.width.call(this, this.el);
    } else {
      width = this.el.clientWidth;
    }

    // Height
    if (isType(this.options.height, 'number')) {
      height = this.options.height;
    } else if (isType(this.options.height, 'function')) {
      height = this.options.height.call(this, this.el);
    } else {
      height = this.el.clientHeight;
    }

    // Apply DPR for retina devices
    this.width = this.el.width = width * this.dpr;
    this.height = this.el.height = height * this.dpr;

    // Scale down
    this.el.style.width = width + 'px';
    this.el.style.height = height + 'px';

    // Padding
    this.waveWidth = this.width * 0.95;
    this.waveLeft = this.width * 0.025;

    // Vertical center
    this.yAxis = this.height / 2;
  };

  /**
   * Clear the canvas so we can redraw
   */
  SineWaves.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  };

  /**
   * Starting time.
   *
   * @type {Number}
   */
  SineWaves.prototype.time = 0;

  /**
   * This updates each of the lines each loop we're running
   *
   * @param  {Number} time (optional) this can be called to
   *                       manually render lines at a certian
   *                       time.
   */
  SineWaves.prototype.update = function(time) {
    this.time = this.time - 0.007;
    if (typeof time === 'undefined') {
      time = this.time;
    }

    var index = -1;
    var length = this.waves.length;

    // Draw each line
    while (++index < length) {
      var timeModifier = this.waves[index].timeModifier || 1;
      this.drawSine(time * timeModifier, this.waves[index]);
    }

    index = void 0;
    length = void 0;
  };

  /**
   * Twice of PI
   *
   * @constant
   * @type {Number}
   */
  var PI2 = Math.PI * 2;

  /**
   * Half of PI
   *
   * @constant
   * @type {Number}
   */
  var HALFPI = Math.PI / 2;

  /**
   * Easing function to control how string each wave is from
   * left to right
   *
   * @param  {Number} percent   where in the line are we?
   * @param  {Number} amplitude the current strength
   *
   * @return {Number}           the new strength
   */
  SineWaves.prototype.ease = function(percent, amplitude) {
    return amplitude * (Math.sin(percent * PI2 - HALFPI) + 1) * 0.5;
  };

  /**
   * Calculate the x, y coordinates of a point in a sine wave
   *
   * @param  {Number} time     Internal time index
   * @param  {Number} position Pixels x poistion
   * @param  {Object} options  Wave options
   *
   * @return {Object}          {x, y}
   */
  SineWaves.prototype.getPoint = function(time, position, options) {
    var x = (time * this.speed) + (-this.yAxis + position) / options.wavelength;
    var y = Math.sin(x);

    // Left and Right Sine Easing
    var amplitude = this.ease(position / this.waveWidth, options.amplitude);

    x = position + this.waveLeft;
    y = amplitude * y + this.yAxis;

    return {
      x: x,
      y: y
    };
  };

  /**
   * Draws one line on the canvas
   *
   * @param  {Number} time    current internal clock time
   * @param  {Object} options wave options
   */
  SineWaves.prototype.drawSine = function(time, options) {
    // Setup defaults
    options = extend(this.defaultWave, options || {});

    // Styles
    this.ctx.lineWidth = options.lineWidth * this.dpr;
    this.ctx.strokeStyle = options.strokeStyle;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();

    // Starting Line
    this.ctx.moveTo(0, this.yAxis);
    this.ctx.lineTo(this.waveLeft, this.yAxis);

    var i;
    var point;

    for (i = 0; i < this.waveWidth; i += options.segmentLength) {
      point = this.getPoint(time, i, options);

      this.ctx.lineTo(point.x, point.y);
      point = void 0;
    }

    i = void 0;

    // Ending Line
    this.ctx.lineTo(this.width, this.yAxis);

    // Stroke it
    this.ctx.stroke();
  };

  /**
   * Animation Status
   *
   * @type {Boolean}
   */
  SineWaves.prototype.running = true;

  /**
   * Animation Loop Controller
   */
  SineWaves.prototype.loop = function() {
    if (this.running === true) {
      this.clear();
      this.update();
    }

    window.requestAnimationFrame(this.loop.bind(this));
  };

  return SineWaves;

});
