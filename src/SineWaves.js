/************************************************
 * @file  Constructor and animation controller
 * @author  Isaac Suttell
 ************************************************/

import assign from 'object-assign';
import invariant from 'invariant';

import * as util from './utilities.js';
import * as Waves from './waves.js';
import * as Ease from './ease.js';

export class SineWaves {

  /**
   * Generates multiple customizable animated sines waves
   * using a canvas element. Supports retina displays and
   * limited mobile support
   */
  constructor(options) {
    this.options = assign({
      speed: 10,
      rotate: 0,
      ease: 'Linear',
      wavesWidth: '95%'
    }, options);

    // Save el
    this.el = this.options.el;
    delete this.options.el;
    invariant(
      this.el,
      'A node element must be supplied'
    );

    // Setup the context for reference
    this.ctx = this.el.getContext('2d');

    // Save Waves
    this.waves = this.options.waves;
    delete this.options.waves;
    invariant(
      this.waves && this.waves.length > 0,
      'At least one wave must be supplied'
    );

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
  __loop() {
    if (this.running === true && Date.now() - this.lastFrame > 15) {
      this.update();
      this.lastFrame = Date.now();
    }

    window.requestAnimationFrame(this.__loop);
  }

  getDimension(dimension) {
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
  updateDimensions() {
    // Dimensions
    let width = this.getDimension('width');
    let height = this.getDimension('height');

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
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Get the user wave function or one of the built in functions
   * @private
   */
  __setupWaveFns() {
    let index = -1;
    let length = this.waves.length;
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
  update(time) {
    this.time = this.time - 0.007;
    if (typeof time === 'undefined') {
      time = this.time;
    }

    let index = -1;
    let length = this.waves.length;

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
      let timeModifier = this.waves[index].timeModifier || 1;
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
  getPoint(time, position, options) {
    let x = (time * this.options.speed) + (-this.yAxis + position) / options.wavelength;
    let y = options.waveFn.call(this, x, Waves);

    // Left and Right Sine Easing
    let amplitude = this.easeFn.call(this, position / this.waveWidth, options.amplitude);

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
  drawWave(time, options) {
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
  __setupUserFunctions() {
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
}


/**
 * Takes either pixels or percents and calculates how wide the sine
 * waves should be
 *
 * @param     {Mixed}    value    0, '10px', '90%'
 * @param     {Number}   width    Width for percentages
 * @return    {Number}
 */
SineWaves.getWaveWidth = function(value, width) {
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
}

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
