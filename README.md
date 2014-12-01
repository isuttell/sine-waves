# sine-waves.js

Generator multiple configurable sine waves

[![Build Status](http://img.shields.io/travis/isuttell/sine-waves.svg?style=flat)](https://travis-ci.org/isuttell/sine-waves)
[![Coverage Status](https://img.shields.io/coveralls/isuttell/sine-waves.svg?style=flat)](https://coveralls.io/r/isuttell/sine-waves)
[![Codacy Badge](https://img.shields.io/codacy/a52fd69032474c0ca88dc06ab69a9839.svg?style=flat)](https://www.codacy.com/public/isuttell/sine-waves)
[![Dev Dependencies](http://img.shields.io/david/dev/isuttell/sine-waves.svg?style=flat)](https://david-dm.org/isuttell/sine-waves#info=devDependencies)
[![Release](https://img.shields.io/bower/v/sine-waves.svg?style=flat)](https://github.com/isuttell/sine-waves/tarball/master)

## Bower

```shell
bower install sine-waves --save
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
      timeModifier: 1, // This is multiplied againse `speed`
      lineWidth: 3, // Stroke width
      amplitude: 150,  // How tall is the wave
      wavelength: 200, // How long is the wave
      segmentLength: 20, // How smooth should the line be
      strokeStyle: 'rgba(255, 255, 255, 0.5)' // Stroke color and opacity
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
  initialize: function (){

  },

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
  // Example of the Linear function
  ease: function(percent, amplitude) {
    return amplitude;
  },
```

## Examples on Codepen

* [The Basics](http://codepen.io/isuttell/pen/vENOZw)
* [Animated Borders](http://codepen.io/isuttell/pen/PwPqOw)

## License
SineWaves is open-sourced software licensed under the MIT license

## Release Histort
- v0.1.0 - Initial Release
