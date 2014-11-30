# sine-waves.js

Generator multiple configurable sine waves

[![Build Status](http://img.shields.io/travis/isuttell/sine-waves.svg?style=flat)](https://travis-ci.org/isuttell/sine-waves)
[![Coverage Status](https://img.shields.io/coveralls/isuttell/sine-waves.svg?style=flat)](https://coveralls.io/r/isuttell/sine-waves)
[![Codacy Badge](https://www.codacy.com/project/badge/a52fd69032474c0ca88dc06ab69a9839)](https://www.codacy.com/public/isuttell/sine-waves)
[![Dev Dependencies](http://img.shields.io/david/dev/isuttell/sine-waves.svg?style=flat)](https://david-dm.org/isuttell/sine-waves#info=devDependencies)
[![Release](http://img.shields.io/github/release/isuttell/sine-waves.svg?style=flat)](https://github.com/isuttell/sine-waves/tarball/master)

## Basic Usage
```js
var waves = new SineWaves({
  el: document.getElementById('waves'),

  speed: 8,

  waves: [
    {
      timeModifier: 1,
      lineWidth: 3,
      amplitude: 150,
      wavelength: 200,
      segmentLength: 20,
      strokeStyle: 'rgba(255, 255, 255, 0.5)'
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

## Examples on Codepen

* [The Basics](http://codepen.io/isuttell/pen/vENOZw)
* [Animated Borders](http://codepen.io/isuttell/pen/PwPqOw)

## License
SineWaves is open-sourced software licensed under the MIT license

## Release Histort
- v0.1.0 - Initial Release
