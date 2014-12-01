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
  function defaults(dest, src) {
    if (!isType(src, 'object')) { src = {}; }
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
    options = defaults(defaultOptions, options);

    // Make sure we have a cancas
    this.el = options.el;
    if (!this.el) { throw 'No Canvas Selected'; }

    // Setup the context for reference
    this.ctx = this.el.getContext('2d');

    // Do we have any waves
    this.waves = options.waves;
    if (!this.waves || !this.waves.length) { throw 'No waves specified'; }

    this.dpr = window.devicePixelRatio || 1;

    this._width = options.width;
    this._height = options.height;
    this._wavesWidth = options.wavesWidth;

    this.resizeEvent = options.resizeEvent;
    this.initialize = options.initialize;

    // Setup canvas width/heights
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));

    // If the user supplied a resize event or init call it
    this.setupUserFunctions();

    // Set the speed
    this.speed = options.speed;

    // Setup Easing
    this.easeFn = getFn(Ease, options.ease, 'Linear');

    // Set the canvas rotation
    this.rotation = degreesToRadians(options.rotate);

    // Start the magic
    this.loop();
  }

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
  var getFn = SineWaves.prototype.getFn = function(obj, name, def) {
    if (isType(name, 'function')) {
      return name;
    } else if (isType(name, 'string') && isType(obj[name], 'function')) {
      return obj[name];
    } else {
      return obj[def];
    }
  };

  /**
   * Sets up the user resize event and the initialize event
   */
  SineWaves.prototype.setupUserFunctions = function() {
    // User Resize Function
    if (isType(this.resizeEvent, 'function')) {
      this.resizeEvent.call(this);
      window.addEventListener('resize', this.resizeEvent.bind(this));
    }

    // User initialize
    if (isType(this.initialize, 'function')) {
      this.initialize.call(this);
    }
  };

  /**
   * Default Options
   *
   * @type {Object}
   */
  var defaultOptions = {
    speed: 10,
    rotate: 0,
    ease: 'Linear',
    wavesWidth: '95%'
  };

  /**
   * This stores each wave and is filled by the user
   *
   * @type {Array}
   */
  // SineWaves.prototype.waves = [];

  /**
   * Default speed of all of the waves.
   *
   * @type {Number}
   */
  // SineWaves.prototype.speed = 10;

  /**
   * Defaults for each line created
   *
   * @type {Object}
   */
  var defaultWave = {
    timeModifier: 1,
    amplitude: 50,
    wavelength: 50,
    segmentLength: 10,
    lineWidth: 1,
    strokeStyle: 'rgba(255, 255, 255, 0.2)',
    type: 'Sine'
  };

  /**
   * Takes either pixels or percents and calculates how wide the sine
   * waves should be
   *
   * @param     {Mixed}    value    0, '10px', '90%'
   * @param     {Number}   width    Width for percentages
   *
   * @return    {Number}
   */
  function getWaveWidth(value, width) {
    if (isType(value, 'number')) { return value; }

    value = value.toString();
    if (value.indexOf('%') > -1) {
      value = parseFloat(value);
      if (value  > 1) { value /=  100; }
      return width * value;
    } else if (value.indexOf('px') > -1) {
      return parseInt(value, 10);
    }
  }

  /**
   * Internal resize event to make the canvas fill the screen
   */
  SineWaves.prototype.updateDimensions = function() {
    var width;
    var height;

    // Width
    if (isType(this._width, 'number')) {
      width = this._width;
    } else if (isType(this._width, 'function')) {
      width = this._width.call(this, this.el);
    } else {
      width = this.el.clientWidth;
    }

    // Height
    if (isType(this._height, 'number')) {
      height = this._height;
    } else if (isType(this._height, 'function')) {
      height = this._height.call(this, this.el);
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
    this.waveWidth = getWaveWidth(this._wavesWidth, this.width);

    // Center it
    this.waveLeft = (this.width - this.waveWidth) / 2;

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
  };

  var Ease = SineWaves.prototype.Ease = {};

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
   * Do not apply any easing
   *
   * @param  {Number} percent   where in the line are we?
   * @param  {Number} amplitude the current strength
   *
   * @return {Number}           the new strength
   */
  SineWaves.prototype.Ease.Linear = function(percent, amplitude) {
    return amplitude;
  };

  /**
   * Easing function to control how string each wave is from
   * left to right
   *
   * @param  {Number} percent   where in the line are we?
   * @param  {Number} amplitude the current strength
   *
   * @return {Number}           the new strength
   */
  SineWaves.prototype.Ease.SineIn = function(percent, amplitude) {
    return amplitude * (Math.sin(percent * Math.PI - HALFPI) + 1) * 0.5;
  };

  /**
   * Easing function to control how string each wave is from
   * left to right
   *
   * @param  {Number} percent   where in the line are we?
   * @param  {Number} amplitude the current strength
   *
   * @return {Number}           the new strength
   */
  SineWaves.prototype.Ease.SineOut = function(percent, amplitude) {
    return amplitude * (Math.sin(percent * Math.PI + HALFPI) + 1) * 0.5;
  };

  /**
   * Easing function to control how string each wave is from
   * left to right
   *
   * @param  {Number} percent   where in the line are we?
   * @param  {Number} amplitude the current strength
   *
   * @return {Number}           the new strength
   */
  SineWaves.prototype.Ease.SineInOut = function(percent, amplitude) {
    return amplitude * (Math.sin(percent * PI2 - HALFPI) + 1) * 0.5;
  };

  /**
   * Holds the different types of waves
   *
   * @type    {Object}
   */
  var Waves = SineWaves.prototype.Waves = {};

  /**
   * Default Sine Waves
   *
   * @param    {Number}    x
   */
  SineWaves.prototype.Waves.Sine = function(x) {
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
    if (isType(Math.sign, 'function')) { return Math.sign(x); }

    x = +x; // convert to a number
    if (x === 0 || isNaN(x)) { return x; }
    return x > 0 ? 1 : -1;
  }

  /**
   * Square Waves
   *
   * @param    {Number}    x
   */
  SineWaves.prototype.Waves.Square = function(x) {
    return sign(Math.sin(x * PI2));
  };

  /**
   * Sawtooth Waves
   *
   * @param    {Number}    x
   */
  SineWaves.prototype.Waves.Sawtooth = function(x) {
    return x - Math.floor(x + 0.5);
  };

  /**
   * Triangle Waves
   *
   * @param    {Number}    x
   */
  SineWaves.prototype.Waves.Triangle = function(x) {
    return Math.abs(Waves.Sawtooth(x));
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
    var y = options.waveFn(x);

    // Left and Right Sine Easing
    var amplitude = this.easeFn(position / this.waveWidth, options.amplitude);

    x = position + this.waveLeft;
    y = amplitude * y + this.yAxis;

    return {
      x: x,
      y: y
    };
  };

  /**
   * For radian conversion
   *
   * @constant
   * @type    {Number}
   */
  var PI180 = Math.PI / 180;

  /**
   * Convert degress to radians for rotation function
   *
   * @param     {Number}    degrees
   *
   * @return    {Number}
   */
  var degreesToRadians = SineWaves.prototype.degreesToRadians = function(degrees) {
    if (!isType(degrees, 'number')) { throw new TypeError('Degrees is not a number'); }
    return degrees * PI180;
  };

  /**
   * Draws one line on the canvas
   *
   * @param  {Number} time    current internal clock time
   * @param  {Object} options wave options
   */
  SineWaves.prototype.drawWave = function(time, options) {
    // Setup defaults
    options = defaults(defaultWave, options);
    options.waveFn = getFn(Waves, options.type, 'Sine');

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
