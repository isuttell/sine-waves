# sine-waves.js

Generate multiple configurable sine waves using a `canvas` element

[![Build Status](http://img.shields.io/travis/isuttell/sine-waves/master.svg?style=flat)](https://travis-ci.org/isuttell/sine-waves)
[![Coverage Status](https://img.shields.io/coveralls/isuttell/sine-waves/master.svg?style=flat)](https://coveralls.io/r/isuttell/sine-waves)
[![Codacy Badge](https://img.shields.io/codacy/a52fd69032474c0ca88dc06ab69a9839.svg?style=flat)](https://www.codacy.com/public/isuttell/sine-waves)
[![Dev Dependencies](http://img.shields.io/david/dev/isuttell/sine-waves.svg?style=flat)](https://david-dm.org/isuttell/sine-waves?type=dev)
[![Release](https://img.shields.io/npm/v/sine-waves.svg?style=flat)](https://www.npmjs.com/package/sine-waves)


## NPM

```shell
npm install sine-waves --save
```

## Basic Usage
```js
var waves = new SineWaves({
  // Canvas Element
  el: document.getElementById('waves'),

  // General speed of entire wave system
  speed: 8,

  // How many degress should we rotate all of the waves
  rotate: 0,

  // Ease function from left to right
  ease: 'Linear',

  // Specific how much the width of the canvas the waves should be
  // This can either be a number or a percent
  waveWidth: '95%'

  // An array of wave options
  waves: [
    {
      timeModifier: 1,   // This is multiplied againse `speed`
      lineWidth: 3,      // Stroke width
      amplitude: 150,    // How tall is the wave
      wavelength: 200,   // How long is the wave
      segmentLength: 20, // How smooth should the line be
      strokeStyle: 'rgba(255, 255, 255, 0.5)', // Stroke color and opacity
      type: 'sine'       // Wave type
    },
    {
      timeModifier: 1,
      lineWidth: 2,
      amplitude: 150,
      wavelength: 100,
      strokeStyle: 'rgba(255, 255, 255, 0.3)'
    }
  ],

  // Perform any additional initializations here
  initialize: function (){},

  // This function is called whenver the window is resized
  resizeEvent: function() {

    // Here is an example on how to create a gradient stroke
    var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0,"rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.5,"rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1,"rgba(0, 0, 0, 0)");

    var index = -1;
    var length = this.waves.length;
      while(++index < length){
      this.waves[index].strokeStyle = gradient;
    }
  }
});
```

## Easing
The default easing is `Linear` which means the waves are not modified from left to right. Additionally you can specify one of the following easing functions to the waves to modify the amplitude of each wave throughout the width of the canvas.

* `Linear`
* `SineIn`
* `SineOut`
* `SineInOut`

Alternatively you can pass a function directly to the `ease` option when creating a SineWaves instance.

```js
  // Example of linear growth
  ease: function(percent, amplitude) {
    return amplitude * percent;
  },
```

## Wave Types
In addition to the default Sine wave can also generate, `Square`, `Sawtooth`, and `Triangle` waves.

```js
  waves: [
    {
      type: 'Square'
      segmentLength: 1, // The smaller the smoother
    },
    {
      type: 'Sawtooth'
      segmentLength: 1,
    },
    {
      type: 'Triangle'
      segmentLength: 1,
    }
  ],
```

## Custom Waves
You can also specify your own wave function by supplying a function to the type parameter. This function has two arguments: `x` and `waves`. `x` is the location of a point on the x axis and `waves` a helper object with the following functions in it:

* `waves.sine(x)`
* `waves.sign(x)`
* `waves.square(x)`
* `waves.sawtooth(x)`
* `waves.triangle(x)`

```js
  waves: [
    {
      timeModifier: 1,
      lineWidth: 2,
      amplitude: 150,
      wavelength: 200,
      segmentLength: 10,
      strokeStyle: 'rgba(255, 255, 255, 0.5)',
      type: function(x, waves) {
        return Math.sin(x) * waves.sawtooth(x); // Combine two together
      }
    },
    // Additional waves
  ],
```

## Examples on Codepen

* [The Basics](http://codepen.io/isuttell/pen/vENOZw)
* [Animated Borders](http://codepen.io/isuttell/pen/PwPqOw)
* [Rotate](http://codepen.io/isuttell/pen/xbwrxB)
* [Alternative Wave Types](http://codepen.io/isuttell/pen/MYaoKX)

## Mobile
Canvas is supported on most devices however the due limited processing power complex animations may appear choppy. You can either create simplier animations for mobile or disable the animation by setting the `running` property to `false`. Running the `update()` method will update the animation one frame while paused.

```js
var waves = new SineWaves({
  // Canvas Element
  el: document.getElementById('waves'),

  running: false,

  waves: [{}]
});

// or
waves.running = false;

// And then update the animation one frame
waves.update();
```

## License
SineWaves is open-sourced software licensed under the MIT license

## Release History
- v0.3.0 - Refactor, added custom waves, and bug fixes
- v0.2.0-alpha - Added rotate, ease, wavesWidth and wave types options
- v0.1.0-alpha - Initial Release
