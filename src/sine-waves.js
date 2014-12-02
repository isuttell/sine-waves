/* @flow */
/************************************************
 * @file  Constructor and animation controller
 * @author  Isaac Suttell
 ************************************************/

/**
 * Generates multiple customizable animated sines waves
 * using a canvas element. Supports retina displays and
 * limited mobile support
 */
function SineWaves(options) {
  // Save a reference
  options = Utilities.defaults(defaultOptions, options);

  // Make sure we have a cancas
  this.el = options.el;
  if (!this.el) {
    throw 'No Canvas Selected';
  }

  // Setup the context for reference
  this.ctx = this.el.getContext('2d');

  // Do we have any waves
  this.waves = options.waves;
  if (!this.waves || !this.waves.length) {
    throw 'No waves specified';
  }

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
  this.easeFn = Utilities.getFn(Ease, options.ease, 'Linear');

  // Set the canvas rotation
  this.rotation = Utilities.degreesToRadians(options.rotate);

  if (Utilities.isType(options.running, 'boolean')) {
    this.running = options.running;
  }

  // Start the magic
  this.loop();
}

/**
 * Sets up the user resize event and the initialize event
 */
SineWaves.prototype.setupUserFunctions = function() {
  // User Resize Function
  if (Utilities.isType(this.resizeEvent, 'function')) {
    this.resizeEvent.call(this);
    window.addEventListener('resize', this.resizeEvent.bind(this));
  }

  // User initialize
  if (Utilities.isType(this.initialize, 'function')) {
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
  if (Utilities.isType(value, 'number')) {
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
}

/**
 * Internal resize event to make the canvas fill the screen
 */
SineWaves.prototype.updateDimensions = function() {
  var width;
  var height;

  // Width
  if (Utilities.isType(this._width, 'number')) {
    width = this._width;
  } else if (Utilities.isType(this._width, 'function')) {
    width = this._width.call(this, this.el);
  } else {
    width = this.el.clientWidth;
  }

  // Height
  if (Utilities.isType(this._height, 'number')) {
    height = this._height;
  } else if (Utilities.isType(this._height, 'function')) {
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
 * Draws one line on the canvas
 *
 * @param  {Number} time    current internal clock time
 * @param  {Object} options wave options
 */
SineWaves.prototype.drawWave = function(time, options) {
  // Setup defaults
  options = Utilities.defaults(defaultWave, options);
  options.waveFn = Utilities.getFn(Waves, options.type, 'Sine');

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
    this.update();
  }

  window.requestAnimationFrame(this.loop.bind(this));
};

/**
 * Make the Wave functions available
 *
 * @type    {Object}
 */
SineWaves.prototype.Waves = Waves;

/**
 * Make the Ease functions available
 *
 * @type    {Object}
 */
SineWaves.prototype.Ease = Ease;
